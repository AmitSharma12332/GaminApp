export const calculateProfitAndLoss = (stake, odds, type, category) => {
  let profit = 0;
  let loss = 0;

  category = category.toLowerCase().trim();
  type = type.toLowerCase().trim();

  switch (category) {
    case "match odds":
      if (type === "back") {
        profit = stake * (odds - 1);
        loss = stake;
      } else if (type === "lay") {
        profit = stake;
        loss = stake * (odds - 1);
      } else {
        return { error: "Invalid bet type! Must be 'back' or 'lay'." };
      }
      break;

    case "bookmaker":
      if (type === "back") {
        profit = (odds * stake) / 100;
        loss = stake;
      } else if (type === "lay") {
        profit = stake;
        loss = (odds * stake) / 100;
      } else {
        return { error: "Invalid bet type! Must be 'back' or 'lay'." };
      }
      break;

    case "fancy":
      if (type === "back") {
        profit = (stake * odds) / 100;
        loss = stake;
      } else if (type === "lay") {
        profit = stake;
        loss = (stake * odds) / 100;
      } else {
        return { error: "Invalid bet type! Must be 'yes' or 'no'." };
      }
      break;

    default:
      return {
        error:
          "Invalid category! Must be 'match odds', 'bookmaker', or 'fancy'.",
      };
  }

  return { profit, loss };
};
