// Mongoose Schema for WebIndex
import { Schema, model } from 'mongoose';

const WebIndexSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    origin_url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    keywords: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    contente_preview: {
        type: String
    },
    webpage_offical: {
        type: Boolean,
        required: true,
        default: false
    },
    webpage_flagged: {
        type: Boolean,
        required: true,
        default: false
    },
    webpage_flagged_reason: {
        type: String,
        required: true,
        default: 'No reason given'
    }
});

export default model('WebIndex', WebIndexSchema);