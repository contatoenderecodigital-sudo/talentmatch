import { Stack } from 'expo-router';

// Stack aninhado: mantém todas as telas de "vaga" como uma única entrada
// dentro das abas da empresa (a barra de abas continua visível por cima).
export default function VagaLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
