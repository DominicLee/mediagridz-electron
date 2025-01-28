import OpenAI from 'openai';
import {useSettingsStore} from "stores/settings-store";

let openAIClient: OpenAI;

export const createClient = () => {
  const $settingsStore = useSettingsStore();
  openAIClient = new OpenAI({
    apiKey: $settingsStore.openAIKey, dangerouslyAllowBrowser: true
  });
}

export const extractMetadata = async (directoryList: string[]): Promise<any> => {
  const modelListText = directoryList.join('\n');
  const prompt: string = `i have a directory containing pictures of cars. I want to extract the name of the car from the directory name and/or the filenames. In addition, the files MAY contain the name of photographers and publication (magazines or websites) and the date (year) the photograph was taken. Always consider the names of famous photographers as well as famous magazines and publications from your knowledge. If the publication, photographer and/or year cannot be directly extracted from the filenames, try to determine them yourself. Return the data as JSON for use in a javascript project.\n\nThe format of the JSON should follow this template:\n{"carname": the name of the car, "photographer": the name of the photographer, "publication": the name of the publication, "year": the year the image was published}\n\nIf no photographer or magazine or year can be extracted, you can return null instead.\n\n Filenames to consider follow:\n\n${modelListText}`;
  const response: any = await openAIClient.chat.completions.create({
    messages: [{role: 'user', content: prompt}],
    model: 'gpt-3.5-turbo',
  });
  return response.choices[0].message.content;
}
