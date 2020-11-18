import { RESTDataSource } from 'apollo-datasource-rest';

import { LaunchFromRemote, LaunchReducer } from '../types';

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  async getAllLaunches(): Promise<LaunchReducer[]> {
    const response = await this.get<LaunchFromRemote[]>('launches');
    return Array.isArray(response)
      ? response.map((launch) => this.launchReducer(launch))
      : [];
  }

  launchReducer(launch: LaunchFromRemote): LaunchReducer {
    return {
      id: launch.flight_number || '0',
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site?.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }

  async getLaunchById({
    launchId,
  }: {
    launchId: LaunchReducer['id'];
  }): Promise<LaunchReducer> {
    const response = await this.get<LaunchFromRemote[]>('launches', {
      flight_number: launchId,
    });
    return this.launchReducer(response[0]);
  }

  async getLaunchesByIds({
    launchIds,
  }: {
    launchIds: LaunchReducer['id'][];
  }): Promise<LaunchReducer[]> {
    return Promise.all(
      launchIds.map((launchId) => this.getLaunchById({ launchId }))
    );
  }
}

export default LaunchAPI;
