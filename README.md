
# Flix Framework

Flix is a high-performance JavaScript framework specifically designed for building modern streaming platforms. It combines React-like developer experience with vanilla JavaScript performance, offering a hybrid rendering system that automatically optimizes for different parts of your application.

# Features
🚀 Hybrid Rendering: Combines Virtual DOM for complex UIs with direct DOM updates for streaming content

⚡ Reactive State: Fine-grained reactivity with nested object support

🎬 Streaming Optimized: Built-in support for media streaming components

🛣️ Router with Preloading: Smart route-based code splitting and data preloading

🔌 Plugin System: Extensible architecture with plugin support

📦 Lightweight: Minimal runtime footprint (~15kb gzipped)



## Installation

Install via npm

```bash
  npm install flix-framework
```
    
## Documentation

### Getting started

### Basic Usage


```bash
    import { createApp } from 'flix-framework';

const app = createApp({
  mode: 'hybrid' // 'hybrid' | 'vdom' | 'stream'
});

// Register a component
app.component('video-player', {
  state: {
    videoUrl: '',
    isPlaying: false
  },
  
  methods: {
    play() {
      this.setState({ isPlaying: true });
    },
    pause() {
      this.setState({ isPlaying: false });
    }
  },
  
  template: ({ videoUrl, isPlaying }) => `
    <div class="video-player">
      <video src="${videoUrl}" ${isPlaying ? 'autoplay' : ''}></video>
      <button flix-on="click:${isPlaying ? 'pause' : 'play'}">
        ${isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  `,
  
  // Optimized template for streaming updates
  streamTemplate: ({ videoUrl, isPlaying }) => `
    <video src="${videoUrl}" ${isPlaying ? 'autoplay' : ''}></video>
  `
});

// Set up routing
app.router.addRoute('/watch/:id', 'video-player', {
  stream: true,
  preload: async ({ id }) => {
    const response = await fetch(`/api/videos/${id}`);
    return response.json();
  }
});

// Mount the app
app.mount('#app');
```

### Core Concepts

### Components
Flix components follow a similar pattern to React but with some key differences:

```bash
    app.component('user-profile', {
  state: {
    user: null,
    loading: false
  },
  
  methods: {
    async fetchUser() {
      this.setState({ loading: true });
      const user = await fetch('/api/user').then(r => r.json());
      this.setState({ user, loading: false });
    }
  },
  
  lifecycle: {
    mounted() {
      this.methods.fetchUser();
    }
  },
  
  template: ({ user, loading }) => `
    <div class="profile">
      ${loading ? 'Loading...' : `
        <h2>${user.name}</h2>
        <p>${user.email}</p>
      `}
    </div>
  `
});
```

### State Management
Flix provides both component-local and global state management:

```bash
    // Global state
app.state.setState('user', { name: 'John Doe' });

// Subscribe to changes
app.state.subscribe('user', (newUser, oldUser) => {
  console.log('User changed:', newUser);
});

// Local component state
this.setState({ loading: true });
```

### Routing
The router supports dynamic routes, preloading, and streaming:

```bash
app.router.addRoute('/movies/:genre', 'movie-list', {
  preload: async ({ genre }) => {
    const movies = await fetch(`/api/movies/${genre}`).then(r => r.json());
    return { movies };
  }
});

// Programmatic navigation
app.router.navigate('/movies/action');
```
## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://my-portfolio-aork.onrender.com)


