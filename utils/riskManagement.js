const { retrieveBalance } = require("../models/data.model");
const { roundToTwoDecimals } = require("../utils/helperFunctions");

exports.riskManageVolume = async (
  entry,
  stopLoss,
  riskPerc,
  baseCurrency,
  apiKey,
  apiSecret
) => {
  const accountBalance = await retrieveBalance(apiKey, apiSecret);

  const roundedAccountBalance = roundToTwoDecimals(
    accountBalance[baseCurrency]
  );
  const riskAmount = roundToTwoDecimals(roundedAccountBalance * riskPerc);

  const stopDistance = entry - stopLoss;
  const stopAverage = (entry + stopLoss) / 2;
  const stopPercentage = stopDistance / stopAverage

  const volume = Math.abs(riskAmount / stopPercentage / entry);
  
  return volume;
};
