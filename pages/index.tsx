import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Airtable, { Table, Records, FieldSet } from 'airtable';
import WorkoutSection from '../components/WorkoutSection';
import Modal from '../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faChevronRight, faChevronLeft, faCheck, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

interface ExerciseRecord extends FieldSet {
    [key: string]: any;  // Ensuring compliance with FieldSet
    WorkoutWeek?: string;
    WorkoutDay?: string;
    Group?: string;
    Exercises?: string;
    Rounds?: number;
    Reps?: string;
    Rest?: number;
    Notes?: string;
    id?: string;
}

interface Exercise {
    id: string;
    fields: ExerciseRecord;
}

interface User {
    id: string;
    email: string;
    name: string;
}

interface HomePageProps {
    workoutData: Exercise[];
}

interface Progress {
  exerciseId: string;
  completed: boolean;
  lastUpdated: string; // Airtable's ISO timestamp format
}

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 5;  // Reduced from 8 to 5 for 1.25rem total size
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-indicator">
      <svg width="1.25rem" height="1.25rem" viewBox="0 0 12 12">
        {/* Background circle */}
        <circle
          cx="6"
          cy="6"
          r={radius}
          stroke="rgba(48, 209, 88, 0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="6"
          cy="6"
          r={radius}
          stroke="#30D158"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90, 6, 6)"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};

const HomePage: NextPage<HomePageProps> = ({ workoutData }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedWorkoutWeek, setSelectedWorkoutWeek] = useState<string>('');
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('');
  const [uniqueWorkoutWeeks, setUniqueWorkoutWeeks] = useState<string[]>([]);
  const [uniqueWorkoutDays, setUniqueWorkoutDays] = useState<string[]>([]);
  const [groupedExercises, setGroupedExercises] = useState<{ [key: string]: Exercise[] }>({});
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [step, setStep] = useState<'week' | 'day' | 'workout' | 'exercise'>('week');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for user authentication
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Load user's progress
      loadUserProgress(JSON.parse(storedUser).id);
    } else {
      router.push('/login');
    }
  }, []);

  const loadUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.progress) {
        const completedSet = new Set<string>(
          data.progress
            .filter((p: Progress) => p.completed)
            .map((p: Progress) => p.exerciseId)
        );
        setCompletedExercises(completedSet);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleExerciseComplete = async (exerciseId: string) => {
    if (!user) return;

    const isCompleted = completedExercises.has(exerciseId);
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          exerciseId,
          completed: !isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      if (data.message === 'Progress updated successfully') {
        setCompletedExercises(prev => {
          const newSet = new Set(prev);
          if (isCompleted) {
            newSet.delete(exerciseId);
          } else {
            newSet.add(exerciseId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    const workoutWeeks = Array.from(new Set(workoutData.map(item => item.fields.WorkoutWeek).filter(week => week !== undefined))) as string[];
    const workoutDays = Array.from(new Set(workoutData.map(item => item.fields.WorkoutDay).filter(day => day !== undefined))) as string[];
    setUniqueWorkoutWeeks(workoutWeeks);
    setUniqueWorkoutDays(workoutDays);

    if (selectedWorkoutWeek && selectedWorkoutDay) {
      const filteredByDay = workoutData.filter(data => data.fields.WorkoutWeek === selectedWorkoutWeek && data.fields.WorkoutDay === selectedWorkoutDay);

      const grouped = filteredByDay
        .filter(record => record.fields.Group !== undefined)  // Filter out records without a Group
        .reduce<{ [key: string]: Exercise[] }>((acc, cur) => {  // Change ExerciseRecord[] to Exercise[]
            const groupKey = cur.fields.Group as string;
            (acc[groupKey] = acc[groupKey] || []).push(cur);  // Push the entire Exercise object
            return acc;
        }, {});

      setGroupedExercises(grouped);
    }
  }, [selectedWorkoutWeek, selectedWorkoutDay, workoutData]);

  const handleWeekSelect = (week: string) => {
    setSelectedWorkoutWeek(week);
    setStep('day');
  };

  const handleDaySelect = (day: string) => {
    setSelectedWorkoutDay(day);
    setStep('workout');
  };

  const handleBack = () => {
    if (step === 'workout') {
      setStep('day');
      setSelectedWorkoutDay('');
      setGroupedExercises({});
    } else if (step === 'day') {
      setStep('week');
      setSelectedWorkoutWeek('');
    }
  };

  const handleExerciseSelect = (groupName: string) => {
    setSelectedExercise(groupName);
    setStep('exercise');
  };

  const handleVideoOpen = (url: string) => {
    setCurrentVideoUrl(url);
    setIsVideoModalOpen(true);
  };

  const getNextExercise = () => {
    const groupNames = Object.keys(groupedExercises);
    const currentIndex = groupNames.indexOf(selectedExercise!);
    return currentIndex < groupNames.length - 1 ? groupNames[currentIndex + 1] : null;
  };

  const handleNext = () => {
    const nextExercise = getNextExercise();
    if (nextExercise) {
      setSelectedExercise(nextExercise);
    } else {
      // Reset to home when finished
      setStep('week');
      setSelectedWorkoutWeek('');
      setSelectedWorkoutDay('');
      setSelectedExercise(null);
      setGroupedExercises({});
    }
  };

  const isGroupCompleted = (groupExercises: Exercise[]) => {  // Update type to Exercise[]
    return groupExercises.every(exercise => completedExercises.has(exercise.id));
  };

  const isDayCompleted = (day: string) => {
    const dayExercises = workoutData.filter(
      data => data.fields.WorkoutWeek === selectedWorkoutWeek && data.fields.WorkoutDay === day
    );
    return dayExercises.length > 0 && dayExercises.every(exercise => completedExercises.has(exercise.id));
  };

  const isWeekCompleted = (week: string) => {
    const weekExercises = workoutData.filter(data => data.fields.WorkoutWeek === week);
    return weekExercises.length > 0 && weekExercises.every(exercise => completedExercises.has(exercise.id));
  };

  const getWeekProgress = (week: string): number => {
    const weekExercises = workoutData.filter(data => data.fields.WorkoutWeek === week);
    if (weekExercises.length === 0) return 0;
    
    const completedCount = weekExercises.filter(exercise => completedExercises.has(exercise.id)).length;
    return Math.round((completedCount / weekExercises.length) * 100);
  };

  // Add function to reset progress
  const resetProgress = async () => {
    if (!user) return;
    
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      try {
        // Get all progress records for the user
        const response = await fetch('/api/progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();
        if (data.progress) {
          // Update all completed exercises to false
          await Promise.all(
            data.progress.map(async (record: Progress) => {
              await fetch('/api/progress', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user.id,
                  exerciseId: record.exerciseId,
                  completed: false,
                }),
              });
            })
          );

          setCompletedExercises(new Set());
        }
      } catch (error) {
        console.error('Error resetting progress:', error);
        alert('Failed to reset progress. Please try again.');
      }
    }
  };

  if (!user) {
    return null; // or a loading state
  }

  if (step === 'exercise' && selectedExercise && groupedExercises[selectedExercise]) {
    const exercises = groupedExercises[selectedExercise];
    const isLastExercise = !getNextExercise();

    return (
      <div className="container">
        <div className="header">
          <h1 className="title">{selectedExercise}</h1>
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
        <div className="exercise-details">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-item">
              <div className="exercise-header">
                <h2 className="exercise-name">{exercise.fields.Exercises}</h2>
                <button 
                  className={`complete-button ${completedExercises.has(exercise.id) ? 'completed' : ''}`}
                  onClick={() => handleExerciseComplete(exercise.id)}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
              <div className="exercise-info">
                <p>Rounds: {exercise.fields.Rounds}</p>
                <p>Reps: {exercise.fields.Reps}</p>
                <p>Rest: {exercise.fields.Rest} min</p>
              </div>
              {exercise.fields.Video && exercise.fields.Video[0] && (
                <button 
                  className="watch-button"
                  onClick={() => handleVideoOpen(exercise.fields.Video![0].url)}
                >
                  Watch example
                  <FontAwesomeIcon icon={faCirclePlay} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="nav-footer">
          <button className="nav-button" onClick={() => setStep('workout')}>
            <FontAwesomeIcon icon={faChevronLeft} /> Exercises
          </button>
          <button className="nav-button next" onClick={handleNext}>
            {isLastExercise ? 'Finish' : 'Next'} <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)}>
          <video controls autoPlay muted src={currentVideoUrl} width="100%">
            Sorry, your browser does not support embedded videos.
          </video>
        </Modal>
      </div>
    );
  }

  if (step === 'workout') {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">{selectedWorkoutDay}: {selectedWorkoutDay === '1' ? 'Legs' : selectedWorkoutDay === '2' ? 'Chest' : selectedWorkoutDay === '3' ? 'Arm Day' : selectedWorkoutDay === '4' ? 'Back Day' : 'Shoulders & Abs'}</h1>
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
        <div className="list-container-v2">
          {Object.entries(groupedExercises).map(([groupName, exercises]) => (
            <button
              key={groupName}
              className={`list-item-v2 ${isGroupCompleted(exercises) ? 'completed' : ''}`}
              onClick={() => handleExerciseSelect(groupName)}
            >
              <span className="item-text-v2">{groupName}</span>
              <div className="button-indicators">
                {isGroupCompleted(exercises) && (
                  <FontAwesomeIcon icon={faCheck} className="check-icon" />
                )}
                <FontAwesomeIcon icon={faChevronRight} className="chevron-v2" />
              </div>
            </button>
          ))}
        </div>
        <div className="nav-footer">
          <button className="nav-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} /> Day
          </button>
        </div>
      </div>
    );
  }

  if (step === 'week') {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">Select a week to begin</h1>
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
        <div className="list-container-v2">
          {uniqueWorkoutWeeks
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(week => {
              const progress = getWeekProgress(week);
              return (
                <button
                  key={week}
                  className={`list-item-v2 ${isWeekCompleted(week) ? 'completed' : ''}`}
                  onClick={() => handleWeekSelect(week)}
                >
                  <span className="item-text-v2">Week {week}</span>
                  <div className="button-indicators">
                    {progress === 0 ? (
                      <span className="not-started-pill">Not started</span>
                    ) : (
                      <CircularProgress progress={progress} />
                    )}
                    {isWeekCompleted(week) && (
                      <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    )}
                    <FontAwesomeIcon icon={faChevronRight} className="chevron-v2" />
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    );
  }

  if (step === 'day') {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">Select a day</h1>
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
        <div className="list-container-v2">
          {uniqueWorkoutDays
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(day => (
              <button
                key={day}
                className={`list-item-v2 ${isDayCompleted(day) ? 'completed' : ''}`}
                onClick={() => handleDaySelect(day)}
              >
                <span className="item-text-v2">{day}: {day === '1' ? 'Legs' : day === '2' ? 'Chest' : day === '3' ? 'Arm Day' : day === '4' ? 'Back Day' : 'Shoulders & Abs'}</span>
                <div className="button-indicators">
                  {isDayCompleted(day) && (
                    <FontAwesomeIcon icon={faCheck} className="check-icon" />
                  )}
                  <FontAwesomeIcon icon={faChevronRight} className="chevron-v2" />
                </div>
              </button>
            ))}
        </div>
        <div className="nav-footer">
          <button className="nav-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} /> Week
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">{selectedWorkoutDay}: {selectedWorkoutDay === '1' ? 'Legs' : selectedWorkoutDay === '2' ? 'Chest' : selectedWorkoutDay === '3' ? 'Arm Day' : selectedWorkoutDay === '4' ? 'Back Day' : 'Shoulders & Abs'}</h1>
      <div className="workout-list">
        {Object.entries(groupedExercises).map(([groupName, exercises]) => (
          <WorkoutSection
            key={groupName}
            groupTitle={groupName}
            exercises={exercises.filter(e => e.fields.Exercises !== undefined)}
            isOpen={selectedExercise === groupName}
            onClick={() => handleExerciseSelect(groupName)}
          />
        ))}
      </div>
      <div className="nav-footer">
        <button className="nav-button" onClick={handleBack}>‹ Day</button>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
    const apiKey = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    if (!apiKey || !baseId) {
      throw new Error("Airtable API key or base ID is not set in the environment variables");
    }

    const base = new Airtable({ apiKey }).base(baseId);

    const fetchAllRecords = async (table: Table<ExerciseRecord>): Promise<Exercise[]> => {
      let allRecords: Exercise[] = [];
      try {
        await table.select({ view: "Grid view" }).eachPage((records: Records<ExerciseRecord>, fetchNextPage: () => void) => {
          allRecords = allRecords.concat(records.map(record => ({
            id: record.id,
            fields: record.fields
          })));
          fetchNextPage();
        });
      } catch (error) {
        console.error("Error fetching data from Airtable:", error);
        throw new Error("Error fetching data from Airtable");
      }
      return allRecords;
    };

    const table = base('Workout');
    const records = await fetchAllRecords(table);

    return {
      props: {
        workoutData: records,
      }
    };
};
  

export default HomePage;
