// Stubs for AI flows
export async function aiChatIcebreakerSuggestions(_input?: any): Promise<{ suggestions: string[] }> {
  return { suggestions: [] };
}
export async function aiGenerateProfileBio(_input?: any): Promise<{ bio: string }> {
  return { bio: "" };
}
// Aliases used by some pages
export const generateIcebreakerSuggestions = aiChatIcebreakerSuggestions;
export const generateProfileBio = aiGenerateProfileBio;
export default {};
