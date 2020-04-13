const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  // TODO: Use these variables to record metric values
  let endTime
  let requestWasSuccessful

  const startTime = timeInMs()
  try {
    await axios.get(url)
    requestWasSuccessful = 1;
  }
  catch (e){
    requestWasSuccessful = 0;
  }

  // TODO: Record time it took to get a response
  const TotalTime = timeInMs() - startTime;
  // TODO: Record if a response was successful or not
  const statusCode = axios.statusCode;

  // Example of how to write a single data point
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Successful', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Count', // 'Count' or 'Milliseconds'
        Value: requestWasSuccessful // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

  // Example of how to write a single data point
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds', // 'Count' or 'Milliseconds'
        Value: 0 // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

}

function timeInMs() {
  return new Date().getTime()
}
