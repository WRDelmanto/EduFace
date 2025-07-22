export interface Checkpoint {
  time: number;
  title: string;
}

// Shared checkpoint data across all adaptation handlers
export const VIDEO_CHECKPOINTS: Checkpoint[] = [
  { time: 0, title: "Introduction to bacteriophages" },
  { time: 48, title: "Phages outnumber all organisms" },
  { time: 85, title: "How phages infect bacteria" },
  { time: 117, title: "Phage replication and bacterial death" },
  { time: 154, title: "Humans discover antibiotics" },
  { time: 187, title: "Antibiotic overuse and resistance" },
  { time: 222, title: "Rise of superbugs and threat" },
  { time: 254, title: "Phages as targeted antibacterial agents" },
  { time: 288, title: "Phage-bacteria evolutionary arms race" },
  { time: 325, title: "Phage therapy successes" },
  { time: 356, title: "Experimental status and clinical trials" }
];

export function findCurrentCheckpoint(currentTime: number): Checkpoint {
  let currentCheckpoint = VIDEO_CHECKPOINTS[0];
  
  for (let i = 0; i < VIDEO_CHECKPOINTS.length; i++) {
    if (VIDEO_CHECKPOINTS[i].time <= currentTime) {
      currentCheckpoint = VIDEO_CHECKPOINTS[i];
    } else {
      break;
    }
  }
  
  return currentCheckpoint;
}

export function findPreviousCheckpoint(currentTime: number): Checkpoint {
  let previousCheckpoint = VIDEO_CHECKPOINTS[0];
  
  for (let i = 0; i < VIDEO_CHECKPOINTS.length; i++) {
    if (VIDEO_CHECKPOINTS[i].time < currentTime) {
      previousCheckpoint = VIDEO_CHECKPOINTS[i];
    } else {
      break;
    }
  }
  
  return previousCheckpoint;
}

export function findNearestCheckpoint(currentTime: number): Checkpoint {
  return findCurrentCheckpoint(currentTime);
}

export function findNextCheckpoint(currentTime: number): Checkpoint | null {
  for (let i = 0; i < VIDEO_CHECKPOINTS.length; i++) {
    if (VIDEO_CHECKPOINTS[i].time > currentTime) {
      return VIDEO_CHECKPOINTS[i];
    }
  }
  return null; // No next checkpoint (end of video)
} 