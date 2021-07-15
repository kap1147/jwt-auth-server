siteSchema = {
  token: {
    _id: Number,
    token: String,
  },
  user: {
    _id: Number,
    email: String,
    password: String,
    googleId: String,
    createdAt: Date,
    isOnline: Boolean,
  },
  profile: {
    _id: Number,
    imageURL: [String],
    alias: String
  },
  post: {
    _id: Number,
    status: String,
    content: String,
    price: Number,
    city: String,
    state: String,
    timestamp: Date,
    photos: [String],
    bids: [String],
    tags: [String],
    location: {
      coordinates: [Number],
      type: 'Point'
    }
  },
  tag: {
    _id: Number,
    title: String,
    desc: String,
    icon: String
  },
  bid: {
    _id: Number,
    status: String,
    paid: Boolean,
    contractor: Number,
    offerPrice: Number,
    offerDate: Date,
    confirmDate: Date,
    confirmPrice: Number,
    timestamp: Date,
  },
  notification: {
    _id: Number,
    receiver: Number,
    sender: Number,
    read: Boolean,
    desc: String,
    flag: String,
    timestamp: Date,
  },
  chat: {
    _id: Number,
    messages : [Number],
    subscribers: [Number],
    viewers: [Number],
  },
  message: {
    _id: Number,
    content: String,
    author: Number,
    timestamp: Date,
  },
}