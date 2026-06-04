package com.wavesplatform.dex.grpc.integration.protobuf

import cats.syntax.option._
import com.google.protobuf.ByteString
import com.wavesplatform.account.Address
import com.wavesplatform.common.state.ByteStr
import com.wavesplatform.dex.collections.Implicits.ListOps
import com.wavesplatform.dex.grpc.integration.services._
import com.wavesplatform.events.protobuf.StateUpdate
import com.wavesplatform.protobuf.Amount
import com.wavesplatform.protobuf.order.{AssetPair, Order}
import com.wavesplatform.protobuf.transaction.{ExchangeTransactionData, PBTransactions}
import com.wavesplatform.state.StateSnapshot
import com.wavesplatform.account.PublicKey
import com.wavesplatform.transaction.Asset
import com.wavesplatform.transaction.Asset.Waves
import com.wavesplatform.transaction.assets.{exchange => ve}
import com.wavesplatform.{account => va}

object WavesToPbConversions {

  val pbWaves = Waves.toPB

  implicit final class VanillaPublicKeyOps(val self: PublicKey) extends AnyVal {
    def toPB: ByteString = ByteString.copyFrom(self.arr)
  }

  implicit final class VanillaExchangeTransactionOps(val tx: ve.ExchangeTransaction) extends AnyVal {

    def toPB: SignedExchangeTransaction =
      SignedExchangeTransaction(
        transaction = Some(
          ExchangeTransaction(
            chainId = tx.chainId.toInt,
            senderPublicKey = tx.sender.toPB,
            fee = Some(Amount(assetId = tx.assetFee._1.toPB, amount = tx.assetFee._2)),
            timestamp = tx.timestamp,
            version = tx.version,
            data = ExchangeTransaction.Data.Exchange(
              ExchangeTransactionData(
                amount = tx.amount.value,
                price = tx.price.value,
                buyMatcherFee = tx.buyMatcherFee,
                sellMatcherFee = tx.sellMatcherFee,
                orders = Seq(tx.buyOrder.toPB, tx.sellOrder.toPB)
              )
            )
          )
        ),
        proofs = tx.proofs.proofs.map(_.toPB)
      )

  }

  implicit final class VanillaAssetOps(val self: Asset) extends AnyVal {

    def toPB: ByteString = self match {
      case Asset.IssuedAsset(assetId) => assetId.toPB
      case Asset.Waves => ByteString.EMPTY
    }

  }

  implicit final class VanillaAddressOps(val self: Address) extends AnyVal {
    def toPB: ByteString = ByteStr(self.bytes).toPB
  }

  implicit final class VanillaOrderOps(val order: ve.Order) extends AnyVal {

    def toPB: Order =
      Order(
        chainId = va.AddressScheme.current.chainId.toInt,
        sender = order.orderAuthentication match {
          case ve.OrderAuthentication.Eip712Signature(sig) =>
            Order.Sender.Eip712Signature(sig.toPB)
          case ve.OrderAuthentication.OrderProofs(key, _) =>
            Order.Sender.SenderPublicKey(key.toPB)
        },
        matcherPublicKey = order.matcherPublicKey.toPB,
        assetPair = Some(AssetPair(order.assetPair.amountAsset.toPB, order.assetPair.priceAsset.toPB)),
        orderSide = order.orderType match {
          case ve.OrderType.BUY => Order.Side.BUY
          case ve.OrderType.SELL => Order.Side.SELL
        },
        priceMode = order.priceMode match {
          case ve.OrderPriceMode.AssetDecimals => Order.PriceMode.ASSET_DECIMALS
          case ve.OrderPriceMode.FixedDecimals => Order.PriceMode.FIXED_DECIMALS
          case ve.OrderPriceMode.Default => Order.PriceMode.DEFAULT
        },
        amount = order.amount.value,
        price = order.price.value,
        timestamp = order.timestamp,
        expiration = order.expiration,
        matcherFee = Some(Amount(order.matcherFeeAssetId.toPB, order.matcherFee.value)),
        version = order.version,
        proofs = order.proofs.map(_.toPB)
      )

  }

  implicit final class VanillaStateSnapshotOps(val self: StateSnapshot) extends AnyVal {

    def toPB: TransactionDiff = {
      val balanceUpdates = self.balances.map { case ((address, asset), balance) =>
        StateUpdate.BalanceUpdate(
          address = address.toPB,
          amountAfter = Amount(asset.toPB, balance).some
        )
      }.toList

      val leasingUpdates = self.leaseBalances.map { case (address, leaseBalance) =>
        StateUpdate.LeasingUpdate(
          address = address.toPB,
          inAfter = leaseBalance.in,
          outAfter = leaseBalance.out
        )
      }.toList

      val dataEntries = self.accountData.view.flatMap { case (address, dataEntriesMap) =>
        dataEntriesMap.values.map { dataEntry =>
          StateUpdate.DataEntryUpdate(
            address = address.toPB,
            dataEntry = PBTransactions.toPBDataEntry(dataEntry).some
          )
        }
      }.toList

      TransactionDiff(
        stateUpdate = StateUpdate(
          balances = balanceUpdates,
          leasingForAddress = leasingUpdates,
          dataEntries = dataEntries,
          assets = Nil
        ).some
      )
    }

  }

  implicit final class VanillaByteStrOps(val self: ByteStr) extends AnyVal {
    def toPB: ByteString = ByteString.copyFrom(self.arr)
  }

  private case class PortfolioUpdates(
    balanceUpdates: List[StateUpdate.BalanceUpdate],
    leasingUpdates: List[StateUpdate.LeasingUpdate]
  )

}
