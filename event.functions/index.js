const fetch = require("node-fetch");
require("dotenv").config();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
  
  if (!HUBSPOT_ACCESS_TOKEN) {
    throw new Error("HubSpot access token is not set in environment variables.");
  }

  const hubDbUrl = "https://api.hubapi.com/cms/v3/hubdb/tables/106087997/rows";

  try {
    const body = JSON.parse(event.body);

    const hubDbData = {
      values: {
        event_name: body.event_name,
        starting_date: new Date(body.starting_date).getTime(), 
        end_date: new Date(body.end_date).getTime(),
        event_status: body.event_status,
        cancelled: body.cancelled,
      },
    };

    const response = await fetch(hubDbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(hubDbData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `HubSpot API error: ${responseData.message || "Unknown error"}`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Data successfully added to HubDB!",
        data: responseData,
      }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
