import {getModels} from "src/services/DatabaseController";
import {extractMetadata} from "src/services/AIController";

export const getAllModels = async () => {
  return await getModels()
}

export const extractMetadataFromFiles = async (directoryNames: string[]) => {
  const openAIResponse = await extractMetadata(directoryNames);
  console.log(openAIResponse);
  try {
    return JSON.parse(openAIResponse);
  } catch (e) {
    return openAIResponse
  }

}
