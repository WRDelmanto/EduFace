interface AdaptationLogEntry {
  timestamp: string;
  videoTimestamp: number;
  checkpointTitle: string;
  adaptationType: string;
  basicEmotion: string;
  learnerEmotion: string;
  adaptationCount: number;
  maxCount: number;
  message: string;
}

let adaptationMessages: string[] = [];
let adaptationLogs: AdaptationLogEntry[] = [];
let isLoggingActive = false;

export function logAdaptationMessage(message: string) {
  const timestamp = new Date().toLocaleString();
  adaptationMessages.push(`[${timestamp}] ${message}`);
}

export function logAdaptationEvent(
  adaptationType: string,
  videoTimestamp: number,
  checkpointTitle: string,
  basicEmotion: string,
  learnerEmotion: string,
  adaptationCount: number,
  maxCount: number,
  message: string
) {
  if (!isLoggingActive) return;
  
  const timestamp = new Date().toISOString();
  const logEntry: AdaptationLogEntry = {
    timestamp,
    videoTimestamp,
    checkpointTitle,
    adaptationType,
    basicEmotion,
    learnerEmotion,
    adaptationCount,
    maxCount,
    message
  };
  
  adaptationLogs.push(logEntry);
  
  // Format for console and file logging
  const formattedMessage = `[${new Date(timestamp).toLocaleString()}] ${adaptationType} triggered at video ${videoTimestamp.toFixed(1)}s (${checkpointTitle}) - Basic Emotion: ${basicEmotion}, Learner Emotion: ${learnerEmotion} (${adaptationCount}/${maxCount}) - ${message}`;
  
  console.log(formattedMessage);
  adaptationMessages.push(formattedMessage);
}

export function getAdaptationMessages(): string[] {
  return [...adaptationMessages];
}

export function getAdaptationLogs(): AdaptationLogEntry[] {
  return [...adaptationLogs];
}

export function clearAdaptationLogs() {
  adaptationMessages = [];
  adaptationLogs = [];
}

export function startLogging() {
  isLoggingActive = true;
  console.log('Adaptation logging started');
}

export function stopLogging() {
  isLoggingActive = false;
  console.log('Adaptation logging stopped');
}

export function isLogging() {
  return isLoggingActive;
}

function saveAdaptationLogsToFile() {
  try {
    // Create plain text format
    let logText = `Adaptation Logs - ${new Date().toLocaleString()}\n`;
    logText += `==========================================\n\n`;
    
    adaptationLogs.forEach((log, index) => {
      logText += `${index + 1}. ${log.adaptationType} Adaptation\n`;
      logText += `   Timestamp: ${new Date(log.timestamp).toLocaleString()}\n`;
      logText += `   Video Time: ${log.videoTimestamp.toFixed(1)}s\n`;
      logText += `   Checkpoint: ${log.checkpointTitle}\n`;
      logText += `   Basic Emotion: ${log.basicEmotion}\n`;
      logText += `   Learner Emotion: ${log.learnerEmotion}\n`;
      logText += `   Count: ${log.adaptationCount}/${log.maxCount}\n`;
      logText += `   Message: ${log.message}\n`;
      logText += `\n`;
    });
    
    // Create a blob with the plain text data
    const blob = new Blob([logText], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adaptation_logs_${new Date().toISOString().split('T')[0]}.txt`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving adaptation logs to file:', error);
  }
}

// Export function to manually trigger file download
export function downloadAdaptationLogs() {
  saveAdaptationLogsToFile();
}