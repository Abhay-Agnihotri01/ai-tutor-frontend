import { useCallback } from 'react';
import axios from 'axios';

export const useProgressTracking = () => {
  
  const updateLectureProgress = useCallback(async (courseId, lectureId, watchTime, totalDuration) => {
    try {
      await axios.post(`/api/progress/lecture/${courseId}/${lectureId}`, {
        watchTime: Math.floor(watchTime),
        totalDuration: Math.floor(totalDuration)
      });
    } catch (error) {
      console.error('Failed to update lecture progress:', error);
    }
  }, []);

  const updateQuizProgress = useCallback(async (courseId, quizId, submissionId, status, score, maxScore) => {
    try {
      await axios.post(`/api/progress/assignment/${courseId}/${quizId}`, {
        submissionId,
        status,
        score,
        maxScore
      });
    } catch (error) {
      console.error('Failed to update quiz progress:', error);
    }
  }, []);

  const updateAssignmentProgress = useCallback(async (courseId, assignmentId, submissionId, status, score, maxScore) => {
    try {
      await axios.post(`/api/progress/assignment/${courseId}/${assignmentId}`, {
        submissionId,
        status,
        score,
        maxScore
      });
    } catch (error) {
      console.error('Failed to update assignment progress:', error);
    }
  }, []);

  const trackLiveClassAttendance = useCallback(async (courseId, liveClassId, joinTime, leaveTime, totalDuration) => {
    try {
      const duration = Math.floor((leaveTime - joinTime) / 1000);
      const attendancePercentage = (duration / totalDuration) * 100;
      
      await axios.post(`/api/progress/live-attendance`, {
        courseId,
        liveClassId,
        joinedAt: new Date(joinTime).toISOString(),
        leftAt: new Date(leaveTime).toISOString(),
        duration,
        totalDuration,
        attendancePercentage,
        isPresent: attendancePercentage >= 50
      });
    } catch (error) {
      console.error('Failed to update live class attendance:', error);
    }
  }, []);

  return {
    updateLectureProgress,
    updateQuizProgress,
    updateAssignmentProgress,
    trackLiveClassAttendance
  };
};