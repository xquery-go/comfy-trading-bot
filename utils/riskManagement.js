const { retrieveBalance } = require("../models/data.model");
const { roundToTwoDecimals } = require("../utils/helperFunctions");

exports.riskManageVolume = async (entry, stopLoss, riskPerc, baseCurrency) => {
  const accountBalance = await retrieveBalance();

  const roundedAccountBalance = roundToTwoDecimals(
    accountBalance[baseCurrency]
  );
  const riskAmount = roundToTwoDecimals(roundedAccountBalance * riskPerc);

  const stopDistance = entry - stopLoss;
  const stopAverage = (entry + stopLoss) / 2;
  const stopPercentage = roundToTwoDecimals(stopDistance / stopAverage);

  const volume = Math.abs(riskAmount / stopPercentage / entry);

  return volume;
};
