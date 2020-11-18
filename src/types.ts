export interface LaunchFromRemote {
  flight_number: string;
  launch_date_unix: string;
  launch_site: {
    site_name: string;
  };
  mission_name: string;
  links: {
    mission_patch_small: string;
    mission_patch: string;
  };
  rocket: {
    rocket_id: string;
    rocket_name: string;
    rocket_type: string;
  };
}

export interface Mission {
  name: string;
  missionPatchSmall: string;
  missionPatchLarge: string;
}

export interface Rocket {
  id: string;
  name: string;
  type: string;
}

export interface LaunchReducer {
  id: string;
  cursor: string;
  site: string;
  mission: Mission;
  rocket: Rocket;
}
