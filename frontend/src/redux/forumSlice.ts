import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAllForums, 
  getForumById, 
  createTopic, 
  getTopicById, 
  createPost,
  Forum,
  ForumDetail,
  TopicDetail
} from '../api/forumApi';

interface ForumState {
  forums: Forum[];
  currentForum: ForumDetail | null;
  currentTopic: TopicDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: ForumState = {
  forums: [],
  currentForum: null,
  currentTopic: null,
  loading: false,
  error: null
};

export const fetchForums = createAsyncThunk(
  'forum/fetchForums',
  async () => {
    return await getAllForums();
  }
);

export const fetchForumById = createAsyncThunk(
  'forum/fetchForumById',
  async (id: number) => {
    return await getForumById(id);
  }
);

export const createNewTopic = createAsyncThunk(
  'forum/createTopic',
  async (data: { forumId: number; title: string; content: string }) => {
    return await createTopic(data);
  }
);

export const fetchTopicById = createAsyncThunk(
  'forum/fetchTopicById',
  async (id: number) => {
    return await getTopicById(id);
  }
);

export const createNewPost = createAsyncThunk(
  'forum/createPost',
  async (data: { topicId: number; content: string }) => {
    return await createPost(data);
  }
);

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentForum: (state) => {
      state.currentForum = null;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForums.fulfilled, (state, action: PayloadAction<Forum[]>) => {
        state.loading = false;
        state.forums = action.payload;
      })
      .addCase(fetchForums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des forums';
      })
      .addCase(fetchForumById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForumById.fulfilled, (state, action: PayloadAction<ForumDetail>) => {
        state.loading = false;
        state.currentForum = action.payload;
      })
      .addCase(fetchForumById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement du forum';
      })
      .addCase(createNewTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTopic.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createNewTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création du topic';
      })
      .addCase(fetchTopicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicById.fulfilled, (state, action: PayloadAction<TopicDetail>) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement du topic';
      })
      .addCase(createNewPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création du post';
      });
  }
});

export const { clearError, clearCurrentForum, clearCurrentTopic } = forumSlice.actions;
export default forumSlice.reducer; 