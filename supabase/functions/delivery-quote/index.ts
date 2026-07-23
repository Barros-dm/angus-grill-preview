const STORE_ADDRESS = "36 Brymore Road, Canterbury CT1 1JE, UK";
const METERS_PER_MILE = 1609.344;

function zoneFromMiles(miles: number) {
  if (miles <= 7.5) return "local";
  if (miles <= 15) return "extended";
  return "outside";
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

async function geocode(address: string, apiKey: string) {
  const params = new URLSearchParams({
    address,
    region: "uk",
    components: "country:GB",
    key: apiKey
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  const data = await response.json();
  const location = data.results?.[0]?.geometry?.location;
  if (!location) throw new Error("Address not found");
  return location;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

    const { postcode, address } = await request.json();
    const destination = typeof postcode === "string" && postcode.trim() ? postcode : address;
    if (!destination || typeof destination !== "string") {
      return Response.json({ error: "Postcode is required" }, { status: 400, headers: corsHeaders() });
    }

    const [store, customer] = await Promise.all([
      geocode(STORE_ADDRESS, apiKey),
      geocode(`${destination}, United Kingdom`, apiKey)
    ]);

    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    const earthRadiusMeters = 6371000;
    const latDistance = toRadians(customer.lat - store.lat);
    const lngDistance = toRadians(customer.lng - store.lng);
    const haversine =
      Math.sin(latDistance / 2) ** 2 +
      Math.cos(toRadians(store.lat)) *
      Math.cos(toRadians(customer.lat)) *
      Math.sin(lngDistance / 2) ** 2;
    const meters = 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
    const miles = meters / METERS_PER_MILE;
    const zone = zoneFromMiles(miles);

    return Response.json({
      zone,
      miles: Number(miles.toFixed(1)),
      deliverable: zone !== "outside"
    }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not calculate delivery" },
      { status: 500, headers: corsHeaders() }
    );
  }
});
