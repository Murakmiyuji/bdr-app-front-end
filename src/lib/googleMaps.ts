let googleMapsScriptPromise: Promise<void> | null = null;

export type SelectedBattlePlace = {
  placeId: string;
  placeName: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

function getAddressPart(
  comps: google.maps.GeocoderAddressComponent[] | undefined,
  types: string[]
): string | undefined {
  if (!comps) return undefined;
  const found = comps.find((c) => types.some((t) => c.types.includes(t)));
  return found?.long_name;
}

export function mapGooglePlaceToBattlePlace(
  place: google.maps.places.PlaceResult
): SelectedBattlePlace | null {
  const placeId = place.place_id;
  const placeName = place.name;
  const address = place.formatted_address;
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();

  if (!placeId || !placeName || !address) return null;

  return {
    placeId,
    placeName,
    address,
    city: getAddressPart(place.address_components, [
      "locality",
      "administrative_area_level_2",
      "sublocality",
    ]),
    state: getAddressPart(place.address_components, ["administrative_area_level_1"]),
    country: getAddressPart(place.address_components, ["country"]),
    latitude: typeof lat === "number" ? lat : undefined,
    longitude: typeof lng === "number" ? lng : undefined,
  };
}

export function loadGoogleMapsPlaces(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não configurada"));
      return;
    }

    const existing = document.getElementById("google-maps-places-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google Maps")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}
