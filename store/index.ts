import axios from 'axios';
import { ActionTree } from 'vuex';
import { createClient } from 'microcms-js-sdk';
import type {
  Post,
} from '../types';

interface State {
  posts: Post[]
}

export const state = (): State => ({
  posts: [],
});

export const getters = {
  posts(state: State) {
    return state.posts;
  },
};

const makeActions = <T extends ActionTree<State, unknown>>(actions: T): T => actions;

export const actions = makeActions({
  async nuxtServerInit({ commit }) {
    const posts = await createClient({
      serviceDomain: 'attt',
      apiKey: process.env.MICROCMS_API_KEY as string,
    }).getList<Post[]>({ endpoint: 'subeome' }).then((res) => res);
    console.log(posts);
    commit('posts', posts.contents);
  },
});

export const mutations = {
  posts(state: State, payload: Post[]) {
    state.posts = payload;
  },
};
