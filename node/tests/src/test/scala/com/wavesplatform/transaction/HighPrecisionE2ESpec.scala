package com.wavesplatform.transaction

import com.wavesplatform.common.utils.EitherExt2.*
import com.wavesplatform.db.WithDomain
import com.wavesplatform.features.BlockchainFeatures
import com.wavesplatform.lang.directives.values.V5
import com.wavesplatform.lang.v1.compiler.TestCompiler
import com.wavesplatform.test.*
import com.wavesplatform.transaction.Asset.IssuedAsset
import com.wavesplatform.transaction.assets.IssueTransaction
import com.wavesplatform.transaction.assets.exchange.OrderType
import com.wavesplatform.transaction.smart.InvokeScriptTransaction.Payment
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers

class HighPrecisionE2ESpec extends AnyFreeSpec with Matchers with WithDomain {

  private val sender    = TxHelpers.signer(1)
  private val recipient = TxHelpers.signer(2)
  private val dAppAcc   = TxHelpers.signer(3)
  private val matcherAccount = TxHelpers.signer(4)

  private val settings = DomainPresets.RideV6.copy(
    blockchainSettings = DomainPresets.RideV6.blockchainSettings.copy(
      functionalitySettings = DomainPresets.RideV6.blockchainSettings.functionalitySettings.copy(
        preActivatedFeatures = DomainPresets.RideV6.blockchainSettings.functionalitySettings.preActivatedFeatures + (BlockchainFeatures.HighPrecisionAssets.id -> 0)
      )
    )
  )

  "AMZX End-To-End Comprehensive Validation (Standard & 18-Decimals Assets)" - {

    "1. Base native transactions without any custom tokens" in withDomain(settings) { d =>
      // Genesis funding
      d.appendBlock(
        TxHelpers.genesis(sender.toAddress, 100000000000L),
        TxHelpers.genesis(recipient.toAddress, 100000000000L),
        TxHelpers.genesis(dAppAcc.toAddress, 100000000000L)
      )

      // Native transfer
      val transferTx = TxHelpers.transfer(sender, recipient.toAddress, 5000000000L, Asset.Waves)
      d.appendBlock(transferTx)
      d.blockchain.balance(recipient.toAddress, Asset.Waves) shouldBe (100000000000L + 5000000000L)

      // Native mass transfer (with proper fee for 2 recipients: 200000 WAVES)
      val massTx = TxHelpers.massTransfer(
        sender,
        Seq(
          recipient.toAddress -> 1000000000L,
          dAppAcc.toAddress   -> 2000000000L
        ),
        Asset.Waves,
        fee = 200000L
      )
      d.appendBlock(massTx)
      d.blockchain.balance(dAppAcc.toAddress, Asset.Waves) shouldBe (100000000000L + 2000000000L)

      // Native data transaction
      val dataTx = TxHelpers.data(sender, Seq(com.wavesplatform.state.StringDataEntry("network", "AMZX-PRIVATE")))
      d.appendBlock(dataTx)
      d.blockchain.accountData(sender.toAddress, "network").get.value shouldBe "AMZX-PRIVATE"

      // Native Lease and LeaseCancel
      val leaseTx = TxHelpers.lease(sender, recipient.toAddress, 1000000000L)
      d.appendBlock(leaseTx)
      d.blockchain.leaseBalance(sender.toAddress).out shouldBe 1000000000L
      d.blockchain.leaseBalance(recipient.toAddress).in shouldBe 1000000000L

      val cancelLeaseTx = TxHelpers.leaseCancel(leaseTx.id(), sender)
      d.appendBlock(cancelLeaseTx)
      d.blockchain.leaseBalance(sender.toAddress).out shouldBe 0L
      d.blockchain.leaseBalance(recipient.toAddress).in shouldBe 0L

      // Native Alias
      val aliasTx = TxHelpers.createAlias("amzxuser", sender)
      d.appendBlock(aliasTx)
      d.blockchain.resolveAlias(com.wavesplatform.account.Alias.create("amzxuser").explicitGet()).explicitGet() shouldBe sender.toAddress
    }

    "2. Standard token (8 decimals) full lifecycle: Issue, Transfer, Reissue, Burn, MassTransfer, Sponsorship, DApp" in withDomain(settings) { d =>
      d.appendBlock(
        TxHelpers.genesis(sender.toAddress, 100000000000L),
        TxHelpers.genesis(recipient.toAddress, 100000000000L),
        TxHelpers.genesis(dAppAcc.toAddress, 100000000000L),
        TxHelpers.genesis(matcherAccount.toAddress, 100000000000L)
      )

      // A) Issue Standard Token (8 decimals, 10M supply)
      val stdTotal = 10000000L * 100000000L
      val issueStd = TxHelpers.issue(sender, amount = stdTotal, decimals = 8, name = "STDCOIN", reissuable = true)
      val stdAsset = IssuedAsset(issueStd.id())
      d.appendBlock(issueStd)
      d.blockchain.balance(sender.toAddress, stdAsset) shouldBe stdTotal
      d.blockchain.assetDescription(stdAsset).get.decimals shouldBe 8

      // B) Transfer Standard Token
      val sendAmount = 1000000L * 100000000L
      val transferStd = TxHelpers.transfer(sender, recipient.toAddress, sendAmount, stdAsset)
      d.appendBlock(transferStd)
      d.blockchain.balance(recipient.toAddress, stdAsset) shouldBe sendAmount

      // C) Reissue Standard Token (+5M)
      val reissueAmount = 5000000L * 100000000L
      val reissueStd = TxHelpers.reissue(stdAsset, sender, reissueAmount)
      d.appendBlock(reissueStd)
      d.blockchain.assetDescription(stdAsset).get.totalVolume shouldBe BigInt(stdTotal + reissueAmount)

      // D) Burn Standard Token (-2M)
      val burnAmount = 2000000L * 100000000L
      val burnStd = TxHelpers.burn(stdAsset, burnAmount, sender)
      d.appendBlock(burnStd)
      d.blockchain.assetDescription(stdAsset).get.totalVolume shouldBe BigInt(stdTotal + reissueAmount - burnAmount)

      // E) Mass Transfer Standard Token (fee = 200000L)
      val massStd = TxHelpers.massTransfer(
        sender,
        Seq(
          recipient.toAddress -> (500000L * 100000000L),
          dAppAcc.toAddress   -> (500000L * 100000000L)
        ),
        stdAsset,
        fee = 200000L
      )
      d.appendBlock(massStd)
      d.blockchain.balance(dAppAcc.toAddress, stdAsset) shouldBe (500000L * 100000000L)

      // F) Sponsorship Standard Token
      val sponsorStd = TxHelpers.sponsor(stdAsset, Some(100000000L), sender)
      d.appendBlock(sponsorStd)
      d.blockchain.assetDescription(stdAsset).get.sponsorship shouldBe 100000000L

      // G) DApp smart contract with Standard Token payment
      val dAppScript = TestCompiler(V5).compileContract(
        """
          | @Callable(i)
          | func deposit() = {
          |   let payment = i.payments[0]
          |   [
          |     IntegerEntry("last_deposit", payment.amount)
          |   ]
          | }
        """.stripMargin
      )
      val setScript = TxHelpers.setScript(dAppAcc, dAppScript)
      d.appendBlock(setScript)

      val invokeTx = TxHelpers.invoke(
        dApp = dAppAcc.toAddress,
        func = Some("deposit"),
        invoker = recipient,
        payments = Seq(Payment(500000000L, stdAsset)),
        fee = 5000000L
      )
      d.appendBlock(invokeTx)
      d.blockchain.accountData(dAppAcc.toAddress, "last_deposit").get.value shouldBe 500000000L
      d.blockchain.balance(dAppAcc.toAddress, stdAsset) shouldBe (500000L * 100000000L + 500000000L)

      // H) Matcher DEX Order Matching (ExchangeTransaction)
      val buyOrder = TxHelpers.order(
        orderType = OrderType.BUY,
        amountAsset = stdAsset,
        priceAsset = Asset.Waves,
        amount = 100000000L,
        price = 200000000L,
        fee = 300000L,
        sender = recipient,
        matcher = matcherAccount
      )
      val sellOrder = TxHelpers.order(
        orderType = OrderType.SELL,
        amountAsset = stdAsset,
        priceAsset = Asset.Waves,
        amount = 100000000L,
        price = 200000000L,
        fee = 300000L,
        sender = sender,
        matcher = matcherAccount
      )
      val exchangeTx = TxHelpers.exchangeFromOrders(buyOrder, sellOrder, matcher = matcherAccount, fee = 300000L)
      d.appendBlock(exchangeTx)
      d.blockchain.transactionInfo(exchangeTx.id()).isDefined shouldBe true
    }

    "3. High-Precision token (18 decimals) full lifecycle: Issue, Transfer, Reissue, Burn, MassTransfer, Sponsorship, DApp" in withDomain(settings) { d =>
      d.appendBlock(
        TxHelpers.genesis(sender.toAddress, 100000000000L),
        TxHelpers.genesis(recipient.toAddress, 100000000000L),
        TxHelpers.genesis(dAppAcc.toAddress, 100000000000L)
      )

      // A) Issue 18-Decimal Asset (Ethereum style ERC-20 token, 500 tokens with 18 decimals)
      // 500 * 10^18 atomic units = 5,000,000,000,000,000,000 atomic units
      val highTotal = 5000000000000000000L
      val issueHigh = IssueTransaction.create(
        version = TxVersion.V2,
        sender = sender.publicKey,
        name = "ETH18DEC",
        description = "Token with 18 decimals and ERC20 compatibility",
        quantity = highTotal,
        decimals = 18,
        reissuable = true,
        script = None,
        fee = 100000000L,
        timestamp = System.currentTimeMillis()
      ).map(_.signWith(sender.privateKey)).explicitGet()
      val highAsset = IssuedAsset(issueHigh.id())
      d.appendBlock(issueHigh)
      d.blockchain.balance(sender.toAddress, highAsset) shouldBe highTotal
      d.blockchain.assetDescription(highAsset).get.decimals shouldBe 18

      // B) Transfer 18-Decimal Token (1 token = 10^18 atomic units)
      val sendHigh = 1000000000000000000L
      val transferHigh = TxHelpers.transfer(sender, recipient.toAddress, sendHigh, highAsset)
      d.appendBlock(transferHigh)
      d.blockchain.balance(recipient.toAddress, highAsset) shouldBe sendHigh
      d.blockchain.balance(sender.toAddress, highAsset) shouldBe (highTotal - sendHigh)

      // C) Reissue 18-Decimal Token (+1 token = 1 * 10^18 atomic units)
      val reissueHighAmount = 1000000000000000000L
      val reissueHigh = TxHelpers.reissue(highAsset, sender, reissueHighAmount)
      d.appendBlock(reissueHigh)
      d.blockchain.assetDescription(highAsset).get.totalVolume shouldBe BigInt(highTotal + reissueHighAmount)

      // D) Burn 18-Decimal Token (-0.5 tokens = 5 * 10^17 atomic units)
      val burnHighAmount = 500000000000000000L
      val burnHigh = TxHelpers.burn(highAsset, burnHighAmount, sender)
      d.appendBlock(burnHigh)
      d.blockchain.assetDescription(highAsset).get.totalVolume shouldBe BigInt(highTotal + reissueHighAmount - burnHighAmount)

      // E) Mass Transfer 18-Decimal Token (fee = 200000L)
      val massHigh = TxHelpers.massTransfer(
        sender,
        Seq(
          recipient.toAddress -> 250000000000000000L,
          dAppAcc.toAddress   -> 250000000000000000L
        ),
        highAsset,
        fee = 200000L
      )
      d.appendBlock(massHigh)
      d.blockchain.balance(dAppAcc.toAddress, highAsset) shouldBe 250000000000000000L

      // F) Sponsorship 18-Decimal Token
      val sponsorHigh = TxHelpers.sponsor(highAsset, Some(1000000000000000000L), sender)
      d.appendBlock(sponsorHigh)
      d.blockchain.assetDescription(highAsset).get.sponsorship shouldBe 1000000000000000000L

      // G) DApp smart contract with 18-Decimal Token payment
      val dAppScript = TestCompiler(V5).compileContract(
        """
          | @Callable(i)
          | func deposit18() = {
          |   let payment = i.payments[0]
          |   [
          |     IntegerEntry("last_high_deposit", payment.amount)
          |   ]
          | }
        """.stripMargin
      )
      val setScript = TxHelpers.setScript(dAppAcc, dAppScript)
      d.appendBlock(setScript)

      val invokeTx = TxHelpers.invoke(
        dApp = dAppAcc.toAddress,
        func = Some("deposit18"),
        invoker = recipient,
        payments = Seq(Payment(100000000000000000L, highAsset)),
        fee = 5000000L
      )
      d.appendBlock(invokeTx)
      d.blockchain.accountData(dAppAcc.toAddress, "last_high_deposit").get.value shouldBe 100000000000000000L
      d.blockchain.balance(dAppAcc.toAddress, highAsset) shouldBe (250000000000000000L + 100000000000000000L)
    }
  }
}
