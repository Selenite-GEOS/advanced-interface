import type { CommentSaveData, ConnectionSaveData, description, NodeEditorSaveData, NodeSaveData } from '@selenite/graph-editor';
import Dexie, { type EntityTable } from 'dexie';


/** Visual programming graph save data structure . */
export interface Graph {
    /** ID of the graph. */
    id: string
    /** Name of the graph. */
    name: string
    /** Description of the graph. */
    description: string
    /** Author of the graph. */
    author: {
        id: string
        name: string
    }
    /** Public visibility of the graph. */
    public: boolean
    /** Nodes of the graph. */
    nodes: NodeSaveData[]
    /** Connections of the graph. */
    connections: ConnectionSaveData[]
    /** Comments of the graph. */
    comments: CommentSaveData[]
    /** Variables of the graph. */
    variables: NodeEditorSaveData['variables']
    /** Version of the graph. */
    version: number
    /** Date of the last modification. */
    updatedAt: Date
    /** Date of creation. */
    createdAt: Date
    /** User IDs who added this graph to their favorites. */
    favoriteOf: string[]
    /** Version of the GEOS schema. */
    schemaVersion: string
    /** Search tags of the graph. */
    tags: string[]

    /** Menu path. */
    path: string[]

    
    // TODO: input props, output props
}

/** Database instance to work with IndexedDB. */
export const db = new Dexie('selenite') as Dexie & {
    graphs: EntityTable<Graph, 'id'>
};

db.version(1).stores({
  graphs:
    "id,&[name+author.id],name,description,author.id,author.name,public,version,updatedAt,createdAt,favoriteOf,schemaVersion,tags",
});