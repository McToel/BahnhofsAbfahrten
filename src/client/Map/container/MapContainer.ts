import { AllowedHafasProfile, ParsedPolyline } from 'types/HAFAS';
import { createContainer } from 'unstated-next';
import { format } from 'date-fns';
import { ParsedJourneyCourseResponse } from 'types/HAFAS/JourneyCourse';
import {
  ParsedJourneyGeoPosResponse,
  SingleParsedJourneyGeoPos,
} from 'types/HAFAS/JourneyGeoPos';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Axios from 'axios';
import useQuery from 'Common/hooks/useQuery';
import useToggleState from 'Common/hooks/useToggleState';

function useMapDefaults() {
  const query = useQuery();
  let includeFV = true;
  let includeNV = false;
  let onlyRT = true;
  let permanent = false;
  let profile = AllowedHafasProfile.OEBB;

  if ('includeFV' in query) {
    includeFV = Boolean(query.includeFV);
  }
  if ('includeNV' in query) {
    includeNV = Boolean(query.includeNV);
  }
  if ('onlyRT' in query) {
    onlyRT = Boolean(query.onlyRT);
  }
  if ('permanent' in query) {
    permanent = Boolean(query.permanent);
  }
  if (
    'profile' in query &&
    Object.values(AllowedHafasProfile).includes(query.profile)
  ) {
    profile = query.profile;
  }

  return useMemo(
    () => ({
      includeFV,
      includeNV,
      onlyRT,
      permanent,
      profile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

function useMap() {
  const defaults = useMapDefaults();
  const [includeFV, toggleIncludeFV] = useToggleState(defaults.includeFV);
  const [includeNV, toggleIncludeNV] = useToggleState(defaults.includeNV);
  const [onlyRT, toggleOnlyRT] = useToggleState(defaults.onlyRT);
  const [permanent, togglePermanent] = useToggleState(defaults.permanent);
  const [map, setMap] = useState();
  const [profile, setProfile] = useState<AllowedHafasProfile>(defaults.profile);
  const [positions, setPositions] = useState<
    ParsedJourneyGeoPosResponse | undefined
  >();
  const [polylines, setPolylines] = useState<{
    [key: string]: ParsedPolyline;
  }>({});
  const [activeJourney, setActiveJourney] = useState<
    SingleParsedJourneyGeoPos
  >();

  useEffect(() => {
    setActiveJourney(undefined);
    setPolylines({});
  }, [profile]);

  const activePolyline = useMemo(
    () => (activeJourney ? polylines?.[activeJourney.jid] : undefined),
    [activeJourney, polylines]
  );

  useEffect(() => {
    if (activeJourney && !activePolyline) {
      Axios.post<ParsedJourneyCourseResponse>(
        '/api/hafas/experimental/journeycourse',
        {
          jid: activeJourney.jid,
          date: format(activeJourney.date, 'yyyyMMdd'),
        },
        {
          params: {
            profile,
          },
        }
      )
        .then((r) => {
          setPolylines((old) => ({
            ...old,
            [activeJourney.jid]: r.data.polylines[0],
          }));
        })
        .catch(() => {});
    }
  }, [activeJourney, activePolyline, profile]);
  const fetchPositions = useCallback(() => {
    Axios.post(
      '/api/hafas/v1/journeyGeoPos',
      {
        jnyFltrL:
          includeFV && includeNV
            ? undefined
            : [
                {
                  mode: includeNV ? 'INC' : 'EXC',
                  type: 'PROD',
                  value: '1016',
                },
              ],
        ring: {
          cCrd: {
            x: 9997434,
            y: 53557110,
          },
          maxDist: 1000000,
        },
        onlyRT,
      },
      {
        params: {
          profile,
        },
      }
    )
      .then((r) => setPositions(r.data))
      .catch(() => {});
  }, [includeFV, includeNV, onlyRT, profile]);

  useEffect(() => {
    setPositions([]);
    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);

    return () => clearInterval(interval);
  }, [fetchPositions, setPositions]);

  useEffect(() => {
    setPositions((old) => {
      setTimeout(() => setPositions(old));

      return [];
    });
  }, [permanent]);

  return {
    includeFV,
    toggleIncludeFV,
    includeNV,
    toggleIncludeNV,
    onlyRT,
    toggleOnlyRT,
    permanent,
    togglePermanent,
    profile,
    setProfile,
    fetchPositions,
    positions,
    map,
    setMap,
    activePolyline,
    activeJourney,
    setActiveJourney,
  };
}

export default createContainer(useMap);
