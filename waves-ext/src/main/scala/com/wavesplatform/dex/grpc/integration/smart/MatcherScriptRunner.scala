package com.wavesplatform.dex.grpc.integration.smart

import com.wavesplatform.account.{Address, Alias}
import com.wavesplatform.block.Block.BlockId
import com.wavesplatform.common.state.ByteStr
import com.wavesplatform.lang.script.Script
import com.wavesplatform.lang.v1.compiler.Terms.{EVALUATED, TRUE}
import com.wavesplatform.lang.v1.traits.Environment
import com.wavesplatform.lang.v1.traits.domain.Recipient
import com.wavesplatform.lang.{ExecutionError, ValidationError}
import com.wavesplatform.settings.BlockchainSettings
import com.wavesplatform.state.LeaseDetails
import com.wavesplatform.crypto.bls.BlsPublicKey
import com.wavesplatform.state.{AssetDescription, AssetScriptInfo, Blockchain, DataEntry, LeaseBalance, TxMeta, VolumeAndFee, ConflictGenerators, GenerationPeriod, Height, StateSnapshot}
import com.wavesplatform.transaction.assets.exchange.Order
import com.wavesplatform.transaction.smart.script.ScriptRunner
import com.wavesplatform.transaction.transfer.TransferTransaction
import com.wavesplatform.transaction.{Asset, ERC20Address, Transaction}

import scala.util.control.NoStackTrace

object MatcherScriptRunner {

  def apply(
    script: Script,
    order: Order,
    blockchain: Blockchain,
    useCorrectScriptVersion: Boolean,
    fixUnicodeFunctions: Boolean,
    useNewPowPrecision: Boolean,
    checkEstimatorSumOverflow: Boolean,
    newEvaluatorMode: Boolean,
    checkWeakPk: Boolean,
    fixBigScriptField: Boolean
  ): Either[ExecutionError, EVALUATED] =
    ScriptRunner.applyGeneric(
      in = order,
      blockchain = blockchain,
      script = script,
      isAssetScript = false,
      scriptContainerAddress = Recipient.Address(ByteStr(order.senderPublicKey.toAddress.bytes)),
      defaultLimit = Int.MaxValue,
      default = TRUE,
      useCorrectScriptVersion = useCorrectScriptVersion,
      fixUnicodeFunctions = fixUnicodeFunctions,
      useNewPowPrecision = useNewPowPrecision,
      checkEstimatorSumOverflow = checkEstimatorSumOverflow,
      newEvaluatorMode = newEvaluatorMode,
      checkWeakPk = checkWeakPk,
      enableExecutionLog = false,
      fixBigScriptField = fixBigScriptField,
      fixedThrownError = blockchain.isFeatureActivated(com.wavesplatform.features.BlockchainFeatures.LightNode),
      fixEcrecover = blockchain.isFeatureActivated(com.wavesplatform.features.BlockchainFeatures.EcrecoverFix)
    )._3

  private class Denied(methodName: String)
      extends SecurityException(s"An access to the blockchain.$methodName is denied on DEX")
      with NoStackTrace

  private def kill(methodName: String) = throw new Denied(methodName)

  val deniedBlockchain: Blockchain = new Blockchain {

    override def hasData(address: Address): Boolean = kill("hasData")

    override def transactionInfo(id: BlockId) = kill("transactionInfo")
    override def accountScript(address: Address) = kill("accountScript")
    override def blockHeader(height: Int) = kill("blockHeader")
    override def hitSource(height: Int) = kill("hitSource")
    override def balanceSnapshots(address: Address, from: Int, to: Option[BlockId]) = kill("balanceSnapshots")
    override def hasAccountScript(address: Address) = kill("hasAccountScript")

    override def settings: BlockchainSettings = kill("settings")
    override def height: Int = kill("height")
    override def score: BigInt = kill("score")
    override def carryFee(refId: Option[ByteStr]): Long = kill("carryFee")
    override def heightOf(blockId: ByteStr): Option[Int] = kill("heightOf")

    /** Features related */
    override def approvedFeatures: Map[Short, Height] = kill("approvedFeatures")
    override def activatedFeatures: Map[Short, Height] = kill("activatedFeatures")
    override def featureVotes(height: Height): Map[Short, Int] = kill("featureVotes")
    override def containsTransaction(tx: Transaction): Boolean = kill("containsTransaction")
    override def assetDescription(id: Asset.IssuedAsset): Option[AssetDescription] = kill("assetDescription")
    override def resolveAlias(a: Alias): Either[ValidationError, Address] = kill("resolveAlias")
    override def leaseDetails(leaseId: ByteStr): Option[LeaseDetails] = kill("leaseDetails")
    override def filledVolumeAndFee(orderId: ByteStr): VolumeAndFee = kill("filledVolumeAndFee")

    /** Retrieves Waves balance snapshot in the [from, to] range (inclusive) */
    override def accountData(acc: Address, key: String): Option[DataEntry[_]] = kill("accountData")
    override def leaseBalance(address: Address): LeaseBalance = kill("leaseBalance")
    override def balance(address: Address, mayBeAssetId: Asset): Long = kill("balance")

    override def transferById(id: BlockId): Option[(Int, TransferTransaction)] = kill("transferById")

    /** Block reward related */
    override def blockReward(height: Int): Option[Long] = kill("blockReward")
    override def blockRewardVotes(height: Int): Seq[Long] = kill("blockRewardVotes")
    override def wavesAmount(height: Int): BigInt = kill("wavesAmount")

    override def transactionMeta(id: BlockId): Option[TxMeta] = kill("transactionMeta")
    override def balanceAtHeight(address: Address, height: Int, assetId: Asset): Option[(Int, Long)] = kill("balanceAtHeight")
    override def assetScript(id: Asset.IssuedAsset): Option[AssetScriptInfo] = kill("assetScript")

    override def resolveERC20Address(address: ERC20Address): Option[Asset.IssuedAsset] = kill("resolveERC20Address")

    override def balances(req: Seq[(Address, Asset)]): Map[(Address, Asset), Long] = kill("balances")
    override def committedGenerators(at: GenerationPeriod): IndexedSeq[(Address, BlsPublicKey)] = kill("committedGenerators")
    override def conflictGenerators(at: GenerationPeriod): ConflictGenerators = kill("conflictGenerators")
    override def effectiveBalanceBanHeights(address: Address): Seq[Int] = kill("effectiveBalanceBanHeights")
    override def finalizedHeight: Option[Height] = kill("finalizedHeight")
    override def finalizedHeightAt(at: Height): Option[Height] = kill("finalizedHeightAt")
    override def lastStateHash(refId: Option[ByteStr]): ByteStr = kill("lastStateHash")
    override def leaseBalances(addresses: Seq[Address]): Map[Address, LeaseBalance] = kill("leaseBalances")
    override def transactionInfos(ids: Seq[ByteStr]): Seq[Option[(TxMeta, Transaction)]] = kill("transactionInfos")
    override def transactionSnapshot(id: ByteStr): Option[(StateSnapshot, TxMeta.Status)] = kill("transactionSnapshot")
    override def wavesBalances(addresses: Seq[Address]): Map[Address, Long] = kill("wavesBalances")
  }

}
