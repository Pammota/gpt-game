"use client";
import Image from "next/image";
import { randomImgUrl } from "./utils";
import TinderCard from "react-tinder-card";
import { useMemo, useRef, useState } from "react";
import { Heart } from "@/components/Icons/heart";
import { Xmark } from "@/components/Icons/xmark";
import React from "react";
import { StatusBar } from "@/components/StatusBar";

export default function Home() {
  const nrPhotos = 10;
  const [lastDirection, setLastDirection] = useState();
  const [currentIndex, setCurrentIndex] = useState(nrPhotos - 1);

  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(nrPhotos)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  // @ts-ignore
  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < nrPhotos - 1;
  const canSwipe = currentIndex >= 0;

  // @ts-ignore
  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    // @ts-ignore
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  // @ts-ignore
  const swipe = async (dir) => {
    // @ts-ignore
    if (canSwipe && currentIndex < nrPhotos) {
      // @ts-ignore
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    // @ts-ignore
    await childRefs[newIndex].current.restoreCard();
  };

  // set last direction and decrease current index
  // @ts-ignore
  const swiped = (direction, nameToDelete, index) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  let photoArr = [];
  let n = 0;
  while (n < nrPhotos) {
    photoArr.push({
      component: (
        <div className="relative flex flex-col items-center w-[300px] h-[400px] bg-slate-700 text-white shadow-sm rounded-xl overflow-hidden">
          <Image
            className="w-full select-none shadow-md"
            alt={`${n}`}
            src={randomImgUrl()}
            width="200"
            height="200"
            draggable={false}
          />
          <div className="flex flex-col items-center px-6 py-2">
            <span className="text-2xl font-semibold text-left">A title</span>
            <span className="text-lg font-light">
              This is a description basically, it&apos;s a text that describes
              stuff.
            </span>
          </div>
        </div>
      ),
      name: `${n}`,
    });
    n++;
  }

  return (
    <main className="flex w-full flex-col min-h-screen items-center justify-center p-10 gap-6">
      <div className="flex flex-col justify-center align-center bg-slate-200/40 backdrop-blur-md border-[1px] border-slate-200/40 shadow-inner w-[600px] h-[640px] rounded-2xl">
        <div className="inline-flex w-full h-24 justify-around p-6">
          <span className="bg-sky-400/20 border-[1px] border-sky-300/20 font-medium text-center shadow-md rounded-xl p-2 w-fit h-fit">
            Health <StatusBar value={50} barColor="bg-red-500" />
          </span>
          <span className="bg-sky-400/20 border-[1px] border-sky-300/20 font-medium text-center shadow-md rounded-xl p-2 w-fit h-fit">
            Money <StatusBar value={30} barColor="bg-emerald-500" />
          </span>
          <span className="bg-sky-400/20 border-[1px] border-sky-300/20 font-medium text-center shadow-md rounded-xl p-2 w-fit h-fit">
            Influence <StatusBar value={10} barColor="bg-purple-500" />
          </span>
          <span className="bg-sky-400/20 border-[1px] border-sky-300/20 font-medium text-center shadow-md rounded-xl p-2 w-fit h-fit">
            Safety <StatusBar value={90} />
          </span>
        </div>
        <div className="flex flex-col justify-center items-center h-[70%]">
          {photoArr.map((character, index) => (
            <TinderCard
              // @ts-ignore
              ref={childRefs[index]}
              className="absolute"
              key={character.name}
              onSwipe={(dir) => swiped(dir, character.name, index)}
              onCardLeftScreen={() => outOfFrame(character.name, index)}
            >
              {character.component}
            </TinderCard>
          ))}
        </div>
        <div className="flex flex-col items-center">
          {lastDirection && (
            <div className="text-center">You swiped {lastDirection}</div>
          )}
          <div className="w-1/2 flex flex-row items-center justify-around p-6">
            <span
              onClick={() => swipe("left")}
              className="p-2 rounded-full bg-slate-200/70 cursor-pointer"
            >
              <Xmark className="text-red-500" />
            </span>
            <span
              onClick={() => swipe("right")}
              className="p-2 rounded-full bg-slate-200/70 cursor-pointer"
            >
              <Heart className="text-emerald-500" />
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
