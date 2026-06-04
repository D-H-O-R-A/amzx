package com.wavesplatform.utils.generator

import com.wavesplatform.GenesisBlockGenerator
import com.wavesplatform.common.utils.Base58
import com.wavesplatform.crypto.secureHash
import com.wavesplatform.wallet.Wallet
import com.wavesplatform.account.AddressScheme
import java.io.File
import java.nio.file.Files
import java.nio.charset.StandardCharsets
import scala.concurrent.duration.*

object CustomNetworkGenerator {

  def main(args: Array[String]): Unit = {
    if (args.length < 6) {
      println("Usage: CustomNetworkGenerator <chainId> <supplyCoins> <blockDelaySeconds> <apiKey> <walletPassword> <outputDir>")
      sys.exit(1)
    }

    val chainId = args(0).take(1)
    val supplyCoins = args(1).toLong
    val blockDelaySeconds = args(2).toInt
    val apiKey = args(3)
    val walletPassword = args(4)
    val outputDirStr = args(5)

    val outputDir = new File(outputDirStr)
    if (!outputDir.exists()) outputDir.mkdirs()

    val chainIdByte = chainId.head.toByte
    AddressScheme.current = new AddressScheme {
      override val chainId: Byte = chainIdByte
    }

    // 1. Generate a random secure genesis seed
    val timestamp = System.currentTimeMillis()
    val seedText = s"amzblockchain private network genesis seed - $chainId - $timestamp"
    val seedHash = seedText.getBytes(StandardCharsets.UTF_8)
    val acc = Wallet.generateNewAccount(seedHash, 0)

    val genesisAddress = acc.toAddress.toString
    val genesisSeedBase58 = Base58.encode(seedHash)

    val supplySatoshis = supplyCoins * 100000000L

    // 2. Generate the Genesis Block configuration using the official generator
    val gSettings = GenesisBlockGenerator.Settings(
      networkType = chainId,
      baseTarget = Some(15000L),
      averageBlockDelay = blockDelaySeconds.seconds,
      timestamp = Some(timestamp),
      distributions = List(
        GenesisBlockGenerator.DistributionItem(seedText = seedText, amount = supplySatoshis, nonce = 0, miner = true)
      ),
      preActivatedFeatures = None,
      minBlockTime = None,
      delayDelta = None
    )

    val genesisConfBlock = GenesisBlockGenerator.createConfig(gSettings)

    // 3. Compute secure Blake2b hash of the REST API Key
    val apiKeyHashBytes = secureHash(apiKey.getBytes(StandardCharsets.UTF_8))
    val apiKeyHash = Base58.encode(apiKeyHashBytes)

    val absOutputDir = outputDir.getAbsolutePath

    // 4. Generate custom-blockchain.conf content
    val blockchainConf = s"""# Custom Private Network Blockchain Configuration
waves {
  directory = "$absOutputDir/node-data"

  blockchain {
    type = CUSTOM
    custom {
      address-scheme-character = "$chainId"
      
      functionality {
        feature-check-blocks-period = 100
        blocks-for-feature-activation = 80
        generation-balance-depth-from-50-to-1000-after-height = 0
        reset-effective-balances-at-height = 0
        block-version-3-after-height = 0
        pre-activated-features {
          1 = 0, 2 = 0, 3 = 0, 4 = 0, 5 = 0, 6 = 0, 7 = 0, 8 = 0, 9 = 0, 10 = 0,
          11 = 0, 12 = 0, 13 = 0, 14 = 0, 15 = 0, 16 = 0, 17 = 0, 18 = 0, 19 = 0,
          20 = 0, 21 = 0, 22 = 0, 23 = 0, 24 = 0, 25 = 0
        }
        double-features-periods-after-height = 1000000000
        max-transaction-time-back-offset = 120m
        max-transaction-time-forward-offset = 90m
        lease-expiration = 1000000
        min-asset-info-update-interval = 7
        min-block-time = 5s
        delay-delta = 8
      }
      
      rewards {
        term = 100000
        term-after-capped-reward-feature = 100000
        initial = 600000000
        min-increment = 50000000
        voting-interval = 10000
      }
      
      $genesisConfBlock
    }
  }

  network {
    bind-address = "127.0.0.1"
    port = 6868
    known-peers = []
    node-name = "amz-private-node"
    traffic-watcher {
      stop-sending-threshold = 100 MB
    }
  }

  wallet {
    file = "$absOutputDir/node-data/wallet/wallet.dat"
    password = "$walletPassword"
    seed = "$genesisSeedBase58"
  }

  rest-api {
    enable = yes
    bind-address = "127.0.0.1"
    port = 6869
    api-key-hash = "$apiKeyHash"
  }

  extensions = [
    "com.wavesplatform.dex.grpc.integration.DEXExtension",
    "com.wavesplatform.events.BlockchainUpdates"
  ]

  dex {
    grpc {
      integration {
        host = "127.0.0.1"
        port = 6887
      }
    }
    lp-accounts {
      file-path = "$absOutputDir/lp-accounts.txt"
    }
    order-script-validation {
      allowed-blockchain-state-accounts = []
    }
  }
}
"""

    // 5. Generate custom-matcher.conf content
    val matcherConf = s"""# Custom Private Network Matcher DEX Configuration
waves.dex {
  root-directory = "$absOutputDir/matcher-data"
  data-directory = "$absOutputDir/matcher-data/data"

  address-scheme-character = "$chainId"

  waves-blockchain-client {
    grpc {
      target = "127.0.0.1:6887"
    }
    blockchain-updates-grpc {
      target = "127.0.0.1:6881"
    }
  }

  account-storage {
    type = "in-mem"
  }

  lp-accounts {
    file-path = "$absOutputDir/lp-accounts.txt"
  }

  rest-api {
    address = "127.0.0.1"
    port = 6886
    api-key-hashes = [
      "$apiKeyHash"
    ]
  }

  events-queue {
    type = "local"
    local {
      enable-storing = yes
      clean-before-consume = yes
    }
  }
}
"""

    // Write configurations and files
    Files.write(new File(outputDir, "custom-blockchain.conf").toPath, blockchainConf.getBytes(StandardCharsets.UTF_8))
    Files.write(new File(outputDir, "custom-matcher.conf").toPath, matcherConf.getBytes(StandardCharsets.UTF_8))
    
    val lpFile = new File(outputDir, "lp-accounts.txt")
    if (!lpFile.exists()) Files.write(lpFile.toPath, "".getBytes(StandardCharsets.UTF_8))

    println("\n==================================================")
    println("🚀 CONFIGURATIONS GENERATED SUCCESSFULLY!")
    println("==================================================")
    println(s"Chain ID Character:   $chainId")
    println(s"Initial Supply:      $supplyCoins Coins ($supplySatoshis Satoshis)")
    println(s"Average Block Delay:  $blockDelaySeconds seconds")
    println(s"REST API Password:    $apiKey")
    println(s"REST API Key Hash:    $apiKeyHash")
    println(s"Wallet Password:      $walletPassword")
    println(s"Genesis Address:      $genesisAddress")
    println(s"Genesis Seed (Raw):   $seedText")
    println(s"Genesis Seed (Base58):$genesisSeedBase58")
    println(s"Output Directory:     $absOutputDir")
    println("==================================================\n")
  }
}
