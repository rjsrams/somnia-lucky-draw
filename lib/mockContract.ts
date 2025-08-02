export async function guessNumberMock(guess: number): Promise<{ success: boolean }> {
  const luckyNumber = 7;
  await new Promise((r) => setTimeout(r, 500)); // simulate tx delay
  return { success: guess === luckyNumber };
}

