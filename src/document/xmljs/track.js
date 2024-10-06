//*****************************************************************************
//
// Tracking data
//
//*****************************************************************************

export function createDateStamp(date) {
  if(!date) date = new Date()
  return date.toISOString().split("T")[0]
}
