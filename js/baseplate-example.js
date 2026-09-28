// Synthetic demonstration of dt.py's temperature-offset assignment, not production measurements.
// Measured offset = with-baseplate temperature − bare-pocket temperature.
export const baseplateExample = {
  bare: [700, 704, 708, 712, 716],
  measured: [716, 724, 712, 720, 728],
  states: [[0,1,2,3,4], [0,1,4,3,2], [1,0,4,3,2]],
};
export function assignedTemperatures(assignment) {
  const {bare, measured} = baseplateExample;
  return assignment.map((plate,slot)=>bare[slot]+measured[plate]-bare[plate]);
}
export function temperatureSpan(assignment) {
  const temperatures=assignedTemperatures(assignment);
  return Math.max(...temperatures)-Math.min(...temperatures);
}
