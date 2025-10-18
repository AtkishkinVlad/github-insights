import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <Notifications />
      <Component {...pageProps} />
    </MantineProvider>
  );
}
