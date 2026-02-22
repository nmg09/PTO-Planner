export const getCarryoverMetrics = (
  remaining: number,
  carryoverCap: number
): {
  carryEstimate: number;
  forfeited: number;
  daysToTakeToAvoidForfeit: number;
} => {
  const cappedRemaining = Math.max(remaining, 0);
  const carryEstimate = Math.min(cappedRemaining, carryoverCap);
  const forfeited = Math.max(0, cappedRemaining - carryoverCap);

  return {
    carryEstimate,
    forfeited,
    daysToTakeToAvoidForfeit: forfeited
  };
};
