import Database from 'better-sqlite3';

const DATABASE_NAME = 'pr0nview-db.db';

export class ElectronDatabase {

  private db: any;

  constructor(private databaseName: string = DATABASE_NAME) {
    this.db = new Database(databaseName);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('auto_vacuum = full');
    this.createTables();
  }

  createTables() {
    // SCHEMA
    this.db.prepare(`CREATE TABLE IF NOT EXISTS SchemaVersion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    version NUMBER NOT NULL
    )`).run();

    // MODELS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL UNIQUE
    )`).run();

    // IMAGES
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filePath TEXT NOT NULL,
      fileName TEXT NOT NULL,
      type TEXT,
      width NUMBER NOT NULL,
      height NUMBER NOT NULL,
      lastModified TIMESTAMP NOT NULL,
      sizeOnDisk NUMBER NOT NULL,
      photographer TEXT,
      publication TEXT
    )`).run();

    // VIDEOS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filePath TEXT NOT NULL,
      fileName TEXT NOT NULL,
      type TEXT NOT NULL,
      width NUMBER NOT NULL,
      height NUMBER NOT NULL,
      videoCodec TEXT NOT NULL,
      videoCodecType TEXT NOT NULL,
      videoBitrate NUMBER NOT NULL,
      videoFramerate NUMBER NOT NULL,
      audioBitrate NUMBER NOT NULL,
      audioCodec TEXT NOT NULL,
      audioCodecType TEXT NOT NULL,
      lastModified TIMESTAMP NOT NULL,
      duration NUMBER NOT NULL,
      sizeOnDisk NUMBER NOT NULL,
      thumbnailPath TEXT NOT NULL
    )`).run();

    // MODELS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS VideoModelLookup (
      video_id NUMBER NOT NULL,
      model_id NUMBER NOT NULL,
      PRIMARY KEY (video_id, model_id),
      FOREIGN KEY (video_id) REFERENCES Videos (id) ON DELETE CASCADE,
      FOREIGN KEY (model_id) REFERENCES Models (id) ON DELETE CASCADE
    )`).run();

    // MODELS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS ImageModelLookup (
      image_id NUMBER NOT NULL,
      model_id NUMBER NOT NULL,
      PRIMARY KEY (image_id, model_id),
      FOREIGN KEY (image_id) REFERENCES Images (id) ON DELETE CASCADE,
      FOREIGN KEY (model_id) REFERENCES Models (id) ON DELETE CASCADE
    )`).run();

    // TAGS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`).run();

    // IMAGETAGS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS ImageTags (
      image_id NUMBER NOT NULL,
      tag_id NUMBER NOT NULL,
      PRIMARY KEY (image_id, tag_id),
      FOREIGN KEY (image_id) REFERENCES Images (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES Tags (id) ON DELETE CASCADE
    )`).run();

    // VIDEOTAGS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS VideoTags (
      video_id NUMBER NOT NULL,
      tag_id NUMBER NOT NULL,
      PRIMARY KEY (video_id, tag_id),
      FOREIGN KEY (video_id) REFERENCES Videos (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES Tags (id) ON DELETE CASCADE
    )`).run();

    // LOGS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp NUMBER NOT NULL,
      event TEXT NOT NULL
    )`).run()

    // LAYOUTS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS Layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      definition TEXT NOT NULL
    )`).run()

    // VIDEO PLAYLISTS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS VideoPlaylists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )`).run()

    // VIDEO PLAYLIST JOIN TABLE
    this.db.prepare(`CREATE TABLE IF NOT EXISTS PlaylistVideosLookup (
      playlist_id NUMBER NOT NULL,
      video_id NUMBER NOT NULL,
      position NUMBER NOT NULL,
      PRIMARY KEY (playlist_id, video_id),
      FOREIGN KEY (playlist_id) REFERENCES VideoPlaylists (id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES Videos (id) ON DELETE CASCADE
    )`).run();

    // IMAGE PLAYLISTS
    this.db.prepare(`CREATE TABLE IF NOT EXISTS ImagePlaylists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )`).run()

    // IMAGE PLAYLIST JOIN TABLE
    this.db.prepare(`CREATE TABLE IF NOT EXISTS PlaylistImagesLookup (
      playlist_id NUMBER NOT NULL,
      image_id NUMBER NOT NULL,
      position NUMBER NOT NULL,
      PRIMARY KEY (playlist_id, image_id),
      FOREIGN KEY (playlist_id) REFERENCES ImagePlaylists (id) ON DELETE CASCADE,
      FOREIGN KEY (image_id) REFERENCES Images (id) ON DELETE CASCADE
    );`).run()

  }

  getCurrentVersion() {
    const row = this.db.prepare('SELECT version FROM schema_version WHERE id = 1').get();
    return row ? row.version : 0;
  }

  updateVersion(version: number) {
    this.db.prepare(`INSERT INTO schema_version (id, version) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET version = ?`).run(version, version);
  }

  migrateToVersion1() {
    this.db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id NUMBER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    )`).run();
  }

  getImagesWithTags() {
    const query = `
    SELECT
      Images.id AS image_id,
      Images.filePath,
      Images.fileName,
      Images.width,
      Images.height,
      Images.sizeOnDisk,
      (SELECT GROUP_CONCAT(JSON_OBJECT('id', id, 'name', name))
        FROM (
          SELECT DISTINCT Tags.id, Tags.name
          FROM ImageTags
          INNER JOIN Tags ON ImageTags.tag_id = Tags.id
          WHERE ImageTags.image_id = Images.id
        )
      ) AS tags,
      (SELECT GROUP_CONCAT(JSON_OBJECT('id', id, 'fullName', fullName))
        FROM (
          SELECT DISTINCT Models.id, Models.fullName
          FROM ImageModelLookup
          INNER JOIN Models ON ImageModelLookup.model_id = Models.id
          WHERE ImageModelLookup.image_id = image_id
        )
      ) AS models
    FROM Images
    GROUP BY Images.id;
  `;

    let result = this.db.prepare(query).all();
    for (const image of result) {
      image.tags = image.tags ? JSON.parse(`[${image.tags}]`) : [];
      image.models = image.models ? JSON.parse(`[${image.models}]`) : [];
    }
    return result;
  }

  getVideosWithTags() {
    const query = `
      SELECT Videos.id AS video_id,
      Videos.filePath,
      Videos.fileName,
      Videos.width,
      Videos.height,
      Videos.sizeOnDisk,
      Videos.videoCodec,
      Videos.audioCodec,
      (SELECT GROUP_CONCAT(JSON_OBJECT('id', id, 'name', name))
        FROM (
          SELECT DISTINCT Tags.id, Tags.name
          FROM VideoTags
          INNER JOIN Tags ON VideoTags.tag_id = Tags.id
          WHERE VideoTags.video_id = Videos.id
        )
      ) AS tags,
      (SELECT GROUP_CONCAT(JSON_OBJECT('id', id, 'fullName', fullName))
        FROM (
          SELECT DISTINCT Models.id, Models.fullName
          FROM VideoModelLookup
          INNER JOIN Models ON VideoModelLookup.model_id = Models.id
          WHERE VideoModelLookup.video_id = Videos.id
        )
      ) AS models
      FROM Videos
      GROUP BY Videos.id;
    `;

    let result = this.db.prepare(query).all();
    for (const video of result) {
      video.tags = video.tags ? JSON.parse(`[${video.tags}]`) : [];
      video.models = video.models ? JSON.parse(`[${video.models}]`) : [];
    }
    return result;
  }

  getVideoPlaylistById(playlistId: number) {
    const query =
      `SELECT
        PlaylistVideosLookup.position,
        Videos.id AS video_id,
        Videos.fileName,
        Videos.filePath
      FROM PlaylistVideosLookup
      JOIN Videos ON PlaylistVideosLookup.video_id = Videos.id
      WHERE PlaylistVideosLookup.playlist_id = ?
      ORDER BY PlaylistVideosLookup.position;`;

    return this.db.prepare(query).all(playlistId);
  }

  getAllTags() {
    const query = `SELECT * FROM Tags;`
    return this.db.prepare(query).all()
  }

  getAllModels() {
    const query = `SELECT * FROM Models;`
    return this.db.prepare(query).all()
  }

  insertImages(imageConfig: IMediaImage) {
    if (!this.doesImageExist(imageConfig.filePath, imageConfig.fileName)) {
      const unwrappedConfig: any = this.unwrapConfig(imageConfig);
      const statement = `INSERT INTO Images (${unwrappedConfig.columns}) VALUES (${unwrappedConfig.placeholders})`;
      const insertImage = this.db.prepare(statement).run(unwrappedConfig.values);
      return insertImage.lastInsertRowid;
    } else {
      return this.getImageIdByPath(<TFilePathAndName>{
        filePath: imageConfig.filePath, fileName: imageConfig.fileName
      })
    }
  }

  insertVideos(videoConfig: IMediaVideo) {
    if (!this.doesVideoExist(videoConfig.filePath, videoConfig.fileName)) {
      const unwrappedConfig: any = this.unwrapConfig(videoConfig);
      const statement = `INSERT INTO Videos (${unwrappedConfig.columns}) VALUES (${unwrappedConfig.placeholders})`;
      const insertVideo = this.db.prepare(statement).run(unwrappedConfig.values);
      return insertVideo.lastInsertRowid;
    } else {
      return this.getVideoIdByPath(<TFilePathAndName>{
        filePath: videoConfig.filePath, fileName: videoConfig.fileName
      })
    }
  }

  addTagsToVideo(payload: TAddVideoTag) {
    if (payload.tags.length > 0) {
      const insertTag = this.db.prepare('INSERT INTO Tags (name) VALUES (?)');
      const insertVideoTag = this.db.prepare('INSERT INTO VideoTags (video_id, tag_id) VALUES (?, ?)');
      payload.tags.forEach(tagName => {
        try {
          insertTag.run(tagName);
        } catch (e) {
          console.log(`tag ${tagName} already exists`)
        }
        const tagId = this.db.prepare('SELECT id FROM Tags WHERE name = ?').get(tagName).id;
        try {
          insertVideoTag.run(payload.videoId, tagId);
        } catch (e) {
          console.log(`tag ${tagId} lookup already exists`)
        }
      });
    }
  }

  addTagsToImage(payload: TAddImageTag) {
    if (payload.tags.length > 0) {
      const insertTag = this.db.prepare('INSERT INTO Tags (name) VALUES (?)');
      const insertImageTag = this.db.prepare('INSERT INTO ImageTags (image_id, tag_id) VALUES (?, ?)');
      // Save the tags
      payload.tags.forEach(tagName => {
        try {
          insertTag.run(tagName);
        } catch (e) {
          console.log(`tag ${tagName} already exists`)
        }
        const tagId = this.db.prepare('SELECT id FROM Tags WHERE name = ?').get(tagName).id;
        try {
          insertImageTag.run(payload.imageId, tagId);
        } catch (e) {
          console.log(`tag ${tagId} lookup already exists`)
        }
      });
    }
  }

  addModelsToVideo(payload: TAddVideoModel) {
    // Get the tags
    if (payload.models.length > 0) {
      const insertModel = this.db.prepare('INSERT INTO Models (fullName) VALUES (?)');
      const insertModelLookup = this.db.prepare('INSERT INTO VideoModelLookup (video_id, model_id) VALUES (?, ?)');
      // Save the tags
      payload.models.forEach(modelName => {
        try {
          insertModel.run(modelName);
        } catch (e) {
          console.log(`Model ${modelName} already exists`)
        }
        const modelId = this.db.prepare('SELECT id FROM Models WHERE fullName = ?').get(modelName).id;
        try {
          insertModelLookup.run(payload.videoId, modelId);
        } catch (e) {
          console.log(`Lookup entry already exists`)
        }
      });
    }
  }

  addModelsToImage(payload: TAddImageModel) {
    // Get the tags
    if (payload.models.length > 0) {
      const insertModel = this.db.prepare('INSERT INTO Models (fullName) VALUES (?)');
      const insertModelLookup = this.db.prepare('INSERT INTO ImageModelLookup (image_id, model_id) VALUES (?, ?)');
      // Save the tags
      payload.models.forEach(modelName => {
        try {
          insertModel.run(modelName);
        } catch (e) {
          console.log(`Model ${modelName} already exists`)
        }
        const modelId = this.db.prepare('SELECT id FROM Models WHERE fullName = ?').get(modelName).id;
        try {
          insertModelLookup.run(payload.imageId, modelId);
        } catch (e) {
          console.log(`Lookup entry already exists`)
        }
      });
    }
  }

  createVideoPlayList(payload: TCreateVideoPlaylist) {
    const statement = `INSERT INTO VideoPlaylists (name, description) VALUES (?, ?)`;
    try {
      const createdPlaylist = this.db.prepare(statement).run(payload.name, payload.description);
      return createdPlaylist.lastInsertRowid;
    } catch (e) {
      return this.db.prepare('SELECT id FROM VideoPlaylists WHERE name = ?').get(payload.name).id;
    }
  }

  createImagePlayList(payload: TCreateImagePlaylist) {
    const statement = `INSERT INTO ImagePlaylists (name, description) VALUES (?, ?)`;
    try {
      const createdPlaylist = this.db.prepare(statement).run(payload.name, payload.description);
      return createdPlaylist.lastInsertRowid;
    } catch (e) {
      return this.db.prepare('SELECT id FROM ImagePlaylists WHERE name = ?').get(payload.name).id;
    }
  }

  addVideosToPlaylist(payload: TAddVideosToPlaylist) {
    if (payload.videoIds.length > 0) {
      const insertVideoLookup = this.db.prepare('INSERT INTO PlaylistVideosLookup (playlist_id, video_id, position) VALUES (?, ?, ?)');
      let videoPosition: number = 1;
      payload.videoIds.forEach(videoId => {
        try {
          insertVideoLookup.run(payload.playlistId, videoId, videoPosition++);
        } catch (e) {
          console.log(`Video already exists in playlist`)
        }
      });
    }
  }

  addImagesToPlaylist(payload: TAddImagesToPlaylist) {
    if (payload.imageIds.length > 0) {
      const insertImageLookup = this.db.prepare('INSERT INTO PlaylistImagesLookup (playlist_id, image_id, position) VALUES (?, ?, ?)');
      // Save the videos
      let imagePosition: number = 1;
      payload.imageIds.forEach(imageId => {
        try {
          insertImageLookup.run(payload.playlistId, imageId, imagePosition++);
        } catch (e) {
          console.log(`Image already exists in playlist`)
        }
      });
    }
  }

  getVideoIdByPath(payload: TFilePathAndName): boolean {
    const query = `
    SELECT id
    FROM Videos
    WHERE filePath = ? AND fileName = ?;
  `;
    const stmt = this.db.prepare(query);
    return stmt.get(payload.filePath, payload.fileName);
  }

  getImageIdByPath(payload: TFilePathAndName): boolean {
    const query = `
    SELECT id
    FROM Images
    WHERE filePath = ? AND fileName = ?;
  `;

    const stmt = this.db.prepare(query);
    return stmt.get(payload.filePath, payload.fileName);
  }

  private unwrapConfig(configObject: IMediaVideo | IMediaImage): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const key in configObject) {
      const value = configObject[key];
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        for (const nestedKey in value) {
          flat[nestedKey] = value[nestedKey];
        }
      } else {
        flat[key] = value;
      }
    }

    const columns = Object.keys(flat).join(", ");
    const placeholders = Object.keys(flat).map(() => "?").join(", ");
    const values = Object.values(flat);

    return {columns, placeholders, values};
  }

  doesVideoExist(filePath: string, fileName: string): boolean {
    const query = `
    SELECT COUNT(*) AS count
    FROM Videos
    WHERE filePath = ? AND fileName = ?;
  `;

    const stmt = this.db.prepare(query);
    const result = stmt.get(filePath, fileName);

    return result.count > 0;
  }

  doesImageExist(filePath: string, fileName: string): boolean {
    const query = `
    SELECT COUNT(*) AS count
    FROM Images
    WHERE filePath = ? AND fileName = ?;
  `;

    const stmt = this.db.prepare(query);
    const result = stmt.get(filePath, fileName);

    return result.count > 0;
  }
}
