import { action, Action, thunk, Thunk } from 'easy-peasy';
import { IStats } from '../utils/interfaces';
import { fetchStatistics } from '../services/graphql';

export interface StatisticsModel {
  stats: IStats | null;
  fetchStatisticsData: Thunk<StatisticsModel>;
  setStats: Action<StatisticsModel, IStats>;
}

const statisticsModel: StatisticsModel = {
  stats: null,
  fetchStatisticsData: thunk(async (actions, payload, { getStoreActions }) => {
    const storeActions: any = getStoreActions();
    const stats = await fetchStatistics();

    actions.setStats(stats);
    storeActions.popupsModel.setIsLoadingModalOpen({
      isOpen: false,
      text: '',
    });
  }),
  setStats: action((state, payload) => {
    state.stats = payload;
  }),
};

export default statisticsModel;
