export interface LaunchFromRemote {
  flight_number: number;
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

export interface LaunchReducer {
  id: number;
  cursor: string;
  site: string;
  mission: {
    name: string;
    missionPatchSmall: string;
    missionPatchLarge: string;
  };
  rocket: {
    id: string;
    name: string;
    type: string;
  };
}
