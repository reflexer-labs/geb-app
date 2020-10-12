import { action, Action } from 'easy-peasy';
import { IVotingTx } from '../utils/interfaces';

const INITIAL_VOTING_STATE = [
  {
    id: '123',
    date: 'Nov 10, 2020',
    title: 'Change Stability Fee',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat mattis sit urna, eget tincidunt faucibus adipiscing turpis turpis. Egestas cursus etiam ullamcorper elementum sodales ultricies. Ultricies pharetra consectetur viverra ut velit. Lobortis lectus et tellus laoreet. Maecenas nulla nibh tempus elit neque, a consectetur. Et amet tincidunt viverra nisl. Leo venenatis, senectus tincidunt scelerisque cras purus, nullam sed sit. Dictum nunc, et eleifend posuere facilisi. Quisque vulputate feugiat malesuada in. Morbi aliquet odio aliquam nibh nascetur adipiscing.',
    endsIn: 'Nov 18, 2020',
    isCompleted: false,
    isAbandoned: false,
  },
  {
    id: '456',
    date: 'Feb 10, 2020',
    title: 'Change RAI Ceiling',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat mattis sit urna, eget tincidunt faucibus adipiscing turpis turpis. Egestas cursus etiam ullamcorper elementum sodales ultricies. Ultricies pharetra consectetur viverra ut velit. Lobortis lectus et tellus laoreet. Maecenas nulla nibh tempus elit neque, a consectetur. Et amet tincidunt viverra nisl. Leo venenatis, senectus tincidunt scelerisque cras purus, nullam sed sit. Dictum nunc, et eleifend posuere facilisi. Quisque vulputate feugiat malesuada in. Morbi aliquet odio aliquam nibh nascetur adipiscing.',
    endsIn: '',
    isCompleted: true,
    isAbandoned: false,
  },
  {
    id: '789',
    date: 'Jan 10, 2020',
    title: 'Increase RAI Ceiling',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat mattis sit urna, eget tincidunt faucibus adipiscing turpis turpis. Egestas cursus etiam ullamcorper elementum sodales ultricies. Ultricies pharetra consectetur viverra ut velit. Lobortis lectus et tellus laoreet. Maecenas nulla nibh tempus elit neque, a consectetur. Et amet tincidunt viverra nisl. Leo venenatis, senectus tincidunt scelerisque cras purus, nullam sed sit. Dictum nunc, et eleifend posuere facilisi. Quisque vulputate feugiat malesuada in. Morbi aliquet odio aliquam nibh nascetur adipiscing.',
    endsIn: '',
    isCompleted: true,
    isAbandoned: true,
  },
];

export interface VotingModel {
  list: Array<IVotingTx>;
  operation: number;
  setOperation: Action<VotingModel, number>;
}
const votingModel: VotingModel = {
  list: INITIAL_VOTING_STATE,
  operation: 0,
  setOperation: action((state, payload) => {
    state.operation = payload;
  }),
};

export default votingModel;
