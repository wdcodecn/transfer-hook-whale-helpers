/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/transfer_hook_whale.json`.
 */
export type TransferHookWhale = {
  "address": "C5wGVxugHPB9VBZKZdSnPYXoVkxgfN1YnYtqF5V8Ljsu",
  "metadata": {
    "name": "transferHookWhale",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeExtraAccount",
      "discriminator": [
        162,
        145,
        153,
        36,
        75,
        70,
        32,
        175
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "extraAccountMetaList",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "latestWhaleAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": []
    },
    {
      "name": "transferHook",
      "discriminator": [
        220,
        57,
        220,
        152,
        126,
        125,
        97,
        168
      ],
      "accounts": [
        {
          "name": "sourceToken"
        },
        {
          "name": "mint"
        },
        {
          "name": "destinationToken"
        },
        {
          "name": "owner",
          "docs": [
            "can be SystemAccount or PDA owned by another program"
          ]
        },
        {
          "name": "extraAccountMetaList"
        },
        {
          "name": "latestWhaleAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "whaleAccount",
      "discriminator": [
        178,
        158,
        102,
        119,
        72,
        153,
        76,
        113
      ]
    }
  ],
  "events": [
    {
      "name": "whaleTransferEvent",
      "discriminator": [
        159,
        157,
        228,
        124,
        143,
        75,
        115,
        4
      ]
    }
  ],
  "types": [
    {
      "name": "whaleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whaleAddress",
            "type": "pubkey"
          },
          {
            "name": "transferAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "whaleTransferEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whaleAddress",
            "type": "pubkey"
          },
          {
            "name": "transferAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
