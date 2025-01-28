<template>
  <router-view/>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {createClient, extractMetadata} from "./services/AIController";
import {useRouter} from "vue-router";
import {DATABASE_CALLS} from "./models/database";

const $router = useRouter();

onMounted(async () => {
  //createClient();
  //await $router.push('/display');

  /*  let newVideoFile: IMediaVideo = {
      fileName: `${new Date().getTime()}.mp4`,
      filePath: 'I:\\Transcend\\Videos\\',
      type: 'video',
      metaData: <IVideoMeta>{
        duration: 1000,
        width: 1920,
        height: 1080,
        sizeOnDisk: 100000,
        videoCodec: 'mp4',
        videoBitrate: 2000,
        videoCodecType: 'video',
        audioCodec: 'aac',
        audioBitrate: 1000,
        audioCodecType: 'audio',
        videoFramerate: 25,
        lastModified: 12345
      },
      thumbnailPath: 'thing/foo/bar/thumb.jpg'
    }

    const newlyCreatedId: any = await window.api.databaseCall(DATABASE_CALLS.INSERT_VIDEOS, newVideoFile);
    newVideoFile.id = newlyCreatedId.id;

    let newImageFile: IMediaImage = {
      fileName: `${new Date().getTime()}.jpg`,
      filePath: 'I:\\Transcend\\Images\\',
      type: 'image',
      metaData: {
        sizeOnDisk: 100000,
        width: 1920,
        height: 1080,
        lastModified: 12345
      }
    }

    const newlyCreatedImageId: any = await window.api.databaseCall(DATABASE_CALLS.INSERT_IMAGES, <IMediaImage>newImageFile);
    newImageFile.id = newlyCreatedImageId.id;

    const successV: any = await window.api.databaseCall(DATABASE_CALLS.ADD_TAGS_TO_VIDEO, <TAddVideoTag>{
      videoId: 1,
      tags: ['big cock', 'milf']
    });

    const successI: any = await window.api.databaseCall(DATABASE_CALLS.ADD_TAGS_TO_IMAGE, <TAddImageTag>{
      imageId: 1,
      tags: ['small tits', 'teen']
    });

    const successMV: any = await window.api.databaseCall(DATABASE_CALLS.ADD_MODELS_TO_VIDEO, <TAddVideoModel>{
      videoId: 1,
      models: ['Jenna Jameson']
    });

    const successMI: any = await window.api.databaseCall(DATABASE_CALLS.ADD_MODELS_TO_IMAGE, <TAddImageModel>{
      imageId: 1,
      models: ['Emily R']
    });*/

  /*  const allImages: IMediaImage[] = await window.api.databaseCall(DATABASE_CALLS.GET_IMAGES_WITH_TAGS, {});
    const allVideos: IMediaVideo[] = await window.api.databaseCall(DATABASE_CALLS.GET_VIDEOS_WITH_TAGS, {});
    console.log(allImages);
    console.log(allVideos);*/
})
</script>
