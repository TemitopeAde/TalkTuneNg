import { UploadScriptDataFrontend, UploadScriptResponse, VoiceSettings } from "@/types";

export const uploadScript = async (data: UploadScriptDataFrontend): Promise<UploadScriptResponse> => {
  let response: Response;

  // If in upload mode and a File is provided, optionally read its text content
  // so we can send JSON to the API route that expects JSON.
  let derivedContent: string | undefined = data.content;
  if (data.mode === 'upload' && data.file && !derivedContent) {
    try {
      // Only attempt for text files; DOCX parsing is not implemented client-side
      if (data.file.type === 'text/plain' || data.file.name.toLowerCase().endsWith('.txt')) {
        derivedContent = await data.file.text();
      }
    } catch {
      // Ignore file read errors; server will still store metadata
    }
  }

  // Always send JSON to the /api/scripts/upload route, including audio params and file metadata
  const payload: Record<string, any> = {
    projectName: data.projectName,
    language: data.language,
    content: derivedContent ?? "",
    mode: data.mode,
    userId: data.userId,
    // Audio generation inputs (optional)
    generateAudio: data.generateAudio ?? false,
    voiceModelId: data.voiceModelId, // Selected YarnGPT voice model
    voiceSettings: data.voiceSettings as VoiceSettings | undefined,
  };

  if (data.mode === 'upload') {
    payload.fileName = data.fileName ?? data.file?.name;
    payload.fileSize = data.fileSize ?? data.file?.size;
    payload.fileType = data.fileType ?? data.file?.type;
  }

  response = await fetch("/api/scripts/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || "Failed to upload script");
  }

  return responseData;
};
