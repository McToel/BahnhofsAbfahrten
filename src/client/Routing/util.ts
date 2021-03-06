import { Station } from 'types/station';

/* eslint import/prefer-default-export: 0 */

export function formatDuration(duration: number) {
  const durInMinutes = duration / 1000 / 60;
  const hours = Math.floor(durInMinutes / 60);
  const minutes = Math.floor(durInMinutes % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

export function getRouteLink(
  start: Station,
  destination: Station,
  via: Station[],
  date?: Date | null
) {
  return `/routing/${start.id}/${destination.id}/${
    date?.getTime() || 0
  }/${via.map((v) => `${v.id}|`).join('')}`;
}
