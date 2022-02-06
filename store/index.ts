import axios from 'axios';
import {ActionTree} from 'vuex'
import { createClient } from 'microcms-js-sdk';
import type {
  Post,
} from '../types';

interface State {
  posts: Post[]
}

export const state = (): State => {
  return {
    posts: [],
  };
};

export const getters = {
  posts(state: State) {
    return state.posts;
  },
};

export const mutations = {
  posts (state: State, payload: Post[]) {
    state.posts = payload;
  },
};

const makeActions = <T extends ActionTree<State, unknown>>(actions: T): T => actions;

export const actions = makeActions({
  async nuxtServerInit({commit}) {
    const posts = await createClient({
      serviceDomain: 'attt',
      apiKey: process.env.MICROCMS_API_KEY as string,
    }).getList<Post[]>({endpoint: 'subeome'}).then((res) => res);

    commit('posts', posts);
  }
});
