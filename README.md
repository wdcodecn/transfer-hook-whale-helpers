# Transfer Hook Whale Helpers 🐳

> A sample initializer and listener for the transfer hook whale post

## Initializer

A sample script to call the `initializeExtraAccount` instruction from the transfer hook whale program.
Used for initializing the extra accounts meta list account.

Make sure to replace the keypair file and mint details.

Run with `yarn run initialize`

## Listener

A sample listener for the `whaleTransferEvent` event of the transfer hook whale program.
Gets call whenever a "whale" transfer took place with our token.

Make sure to replace the keypair file details.

Run with `yarn run listener`
