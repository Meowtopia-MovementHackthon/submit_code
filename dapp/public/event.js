window.postMessage = function (type, message) {
  if (typeof type !== "string") {
    window.callToGame(type);
  } else {
    window.parent.postMessage(
      {
        type,
        message,
      },
      "*"
    );
  }
};

window.callToGame = function (event) {
  if (typeof event.type !== "string") return;
  if (typeof event.message !== "string") return;
  console.log("CALL TO GAME!!", event.message);
  if (event.type == "connect-wallet") {
    window.GameInstance?.SendMessage(
      "--- Canvas",
      "ConnectWalletSuccess",
      event.message
    );
  } else if (event.type == "get-nft-list") {
    window.GameInstance?.SendMessage(
      "--- Canvas",
      "GetNFTListSuccess",
      event.message
    );
  } else if (event.type == "mint-nft") {
    window.GameInstance?.SendMessage(
      "GamePlayController",
      "OnMintNFTSuccess",
      event.message
    );
  } else if (event.type == "claim-token") {
    window.GameInstance?.SendMessage(
      "GamePlayController",
      "OnClaimTokenSuccess",
      event.message
    );
  } else if (event.type == "get-token-balance") {
    window.GameInstance?.SendMessage(
      "--- Canvas",
      "OnGetTokenBalaceSuccess",
      event.message
    );
  } else if (event.type == "refesh-token-balance") {
    window.GameInstance?.SendMessage(
      "GamePlayController",
      "OnRefeshBalance",
      event.message
    );
  }
};
