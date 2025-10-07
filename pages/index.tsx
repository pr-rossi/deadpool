import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { githubDb } from '../src/services/githubDatabase';
import Header from '../components/Header';
import WeekView from '../components/WeekView';
import DayView from '../components/DayView';
import WorkoutView from '../components/WorkoutView';
import ExerciseView from '../components/ExerciseView';
import LandingPage from '../components/LandingPage';
import Alert from '../components/Alert';
import ConfirmationModal from '../components/ConfirmationModal';
import { Exercise, User, Progress, HomePageProps, Step, ExerciseRecord } from '../types';
import '../styles/Header.css';
import Modal from '../components/Modal';

const HomePage: NextPage<HomePageProps> = ({ workoutData }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [selectedWorkoutWeek, setSelectedWorkoutWeek] = useState<string>('');
    const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('');
    const [uniqueWorkoutWeeks, setUniqueWorkoutWeeks] = useState<string[]>([]);
    const [uniqueWorkoutDays, setUniqueWorkoutDays] = useState<string[]>([]);
    const [groupedExercises, setGroupedExercises] = useState<{ [key: string]: Exercise[] }>({});
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('landing');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmationCallback, setConfirmationCallback] = useState<() => void>(() => {});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            loadUserProgress(userData.id);
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
            setAlert({
                type: 'error',
                message: 'Failed to update progress. Please try again.'
            });
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
                .filter(record => record.fields.Group !== undefined)
                .reduce<{ [key: string]: Exercise[] }>((acc, cur) => {
                    const groupKey = cur.fields.Group as string;
                    (acc[groupKey] = acc[groupKey] || []).push(cur);
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
        if (step === 'exercise') {
            setStep('workout');
            setSelectedExercise(null);
        } else if (step === 'workout') {
            setStep('day');
            setSelectedWorkoutDay('');
            setGroupedExercises({});
        } else if (step === 'day') {
            setStep('week');
            setSelectedWorkoutWeek('');
        } else if (step === 'week') {
            setStep('landing');
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

    const handleVideoClose = () => {
        setIsVideoModalOpen(false);
    };

    const getNextExercise = () => {
        // Sort group names in the same order as WorkoutView
        const getGroupOrder = (groupName: string): number => {
            if (groupName === 'Warm up') return 0;
            if (groupName === 'Optional Core Circuit') return 999; // Last
            
            // Extract number from "Exercise 1", "Exercise 2", etc.
            const match = groupName.match(/Exercise (\d+)/);
            if (match) {
                return parseInt(match[1], 10);
            }
            
            // For any other groups, put them after exercises but before Optional Core Circuit
            return 100;
        };

        const sortedGroupNames = Object.keys(groupedExercises).sort((a, b) => {
            return getGroupOrder(a) - getGroupOrder(b);
        });
        
        const currentIndex = sortedGroupNames.indexOf(selectedExercise!);
        return currentIndex < sortedGroupNames.length - 1 ? sortedGroupNames[currentIndex + 1] : null;
    };

    const handleNext = () => {
        const nextExercise = getNextExercise();
        if (nextExercise) {
            setSelectedExercise(nextExercise);
        } else {
            setStep('week');
            setSelectedWorkoutWeek('');
            setSelectedWorkoutDay('');
            setSelectedExercise(null);
            setGroupedExercises({});
        }
    };

    const handlePlanSelect = (planId: string) => {
        setStep('week');
    };

    const showConfirmation = (message: string, callback: () => void) => {
        setConfirmationMessage(message);
        setConfirmationCallback(() => callback);
        setIsConfirmationOpen(true);
    };

    const handleConfirm = () => {
        confirmationCallback();
        setIsConfirmationOpen(false);
    };

    const handleRestartPlan = async () => {
        if (!user) return;

        const doRestart = async () => {
            try {
                const response = await fetch('/api/progress/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to reset progress');
                }

                // Reset local state
                setCompletedExercises(new Set());
                setStep('week');
                setAlert({
                    type: 'success',
                    message: 'Workout plan has been reset'
                });
            } catch (error) {
                console.error('Error resetting progress:', error);
                setAlert({
                    type: 'error',
                    message: 'Failed to reset progress. Please try again.'
                });
            }
        };

        showConfirmation(
            'Are you sure you want to restart the plan? All progress will be reset.',
            doRestart
        );
    };

    const handleRestartWeek = async () => {
        if (!user) return;

        const doRestart = async () => {
            try {
                const response = await fetch('/api/progress/reset-week', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        weekNumber: selectedWorkoutWeek,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to reset week progress');
                }

                // Reset local state for the current week's exercises
                const weekExercises = workoutData.filter(
                    exercise => exercise.fields.WorkoutWeek === selectedWorkoutWeek
                );
                
                setCompletedExercises(prev => {
                    const newSet = new Set(prev);
                    weekExercises.forEach(exercise => {
                        newSet.delete(exercise.id);
                    });
                    return newSet;
                });
                setAlert({
                    type: 'success',
                    message: 'Week progress has been reset'
                });
            } catch (error) {
                console.error('Error resetting week progress:', error);
                setAlert({
                    type: 'error',
                    message: 'Failed to reset week progress. Please try again.'
                });
            }
        };

        showConfirmation(
            `Are you sure you want to restart this week? All progress for Week ${selectedWorkoutWeek} will be reset.`,
            doRestart
        );
    };

    if (!user) {
        return null;
    }

    const getDayName = (day: string) => {
        switch (day) {
            case '1': return 'Legs';
            case '2': return 'Chest';
            case '3': return 'Arm Day';
            case '4': return 'Back Day';
            case '5': return 'Shoulders & Abs';
            default: return 'Unknown Day';
        }
    };

    const isLastExerciseInGroup = selectedExercise && groupedExercises[selectedExercise] ? 
        groupedExercises[selectedExercise].length === 1 : 
        false;

    return (
        <div className="container">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <ConfirmationModal
                isOpen={isConfirmationOpen}
                message={confirmationMessage}
                onConfirm={handleConfirm}
                onCancel={() => setIsConfirmationOpen(false)}
            />

            {step !== 'landing' && (
                <Header 
                    title={
                        step === 'week' ? 'Select a week to begin' :
                        step === 'day' ? 'Select a day' :
                        step === 'workout' ? (() => {
                            // If selectedWorkoutDay already contains "Day", use it as is
                            // Otherwise, format it as "Day X - WorkoutType"
                            if (selectedWorkoutDay && selectedWorkoutDay.includes('Day')) {
                                return selectedWorkoutDay;
                            }
                            return `Day ${selectedWorkoutDay} - ${getDayName(selectedWorkoutDay)}`;
                        })() :
                        selectedExercise || ''
                    }
                    onLogout={handleLogout}
                    userEmail={user.email}
                    userName={user.name}
                />
            )}

            {step === 'landing' && (
                <LandingPage 
                    onPlanSelect={() => setStep('week')}
                    userEmail={user.email}
                    userName={user.name}
                    onLogout={handleLogout}
                    workoutData={workoutData}
                    completedExercises={completedExercises}
                />
            )}

            {step === 'week' && (
                <WeekView
                    uniqueWorkoutWeeks={uniqueWorkoutWeeks}
                    completedExercises={completedExercises}
                    onWeekSelect={handleWeekSelect}
                    workoutData={workoutData}
                    onBack={handleBack}
                    onRestartPlan={handleRestartPlan}
                />
            )}

            {step === 'day' && (
                <DayView
                    uniqueWorkoutDays={uniqueWorkoutDays}
                    completedExercises={completedExercises}
                    onDaySelect={handleDaySelect}
                    selectedWorkoutWeek={selectedWorkoutWeek}
                    workoutData={workoutData}
                    onBack={handleBack}
                    onRestartWeek={handleRestartWeek}
                />
            )}

            {step === 'workout' && (
                <WorkoutView
                    groupedExercises={groupedExercises}
                    completedExercises={completedExercises}
                    onExerciseSelect={handleExerciseSelect}
                    onBack={handleBack}
                />
            )}

            {step === 'exercise' && selectedExercise && groupedExercises[selectedExercise] && (
                <ExerciseView
                    exercises={groupedExercises[selectedExercise]}
                    completedExercises={completedExercises}
                    onExerciseComplete={handleExerciseComplete}
                    onVideoOpen={handleVideoOpen}
                    isVideoModalOpen={isVideoModalOpen}
                    currentVideoUrl={currentVideoUrl}
                    onCloseVideo={handleVideoClose}
                    onBack={handleBack}
                    onNext={handleNext}
                    isLastExercise={isLastExerciseInGroup}
                />
            )}

            {isVideoModalOpen && (
                <Modal onClose={handleVideoClose} isOpen={isVideoModalOpen}>
                    <video controls autoPlay muted src={currentVideoUrl} width="100%">
                        Sorry, your browser does not support embedded videos.
                    </video>
                </Modal>
            )}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
    try {
        // Fetch all workout data from GitHub database
        const workoutRecords = await githubDb.getAllWorkouts();
        
        // Convert to the expected format
        const workoutData: Exercise[] = workoutRecords.map(record => ({
            id: record.id,
            fields: {
                WorkoutWeek: record.WorkoutWeek,
                WorkoutDay: record.WorkoutDay,
                Group: record.Group,
                Exercises: record.Exercises,
                Rounds: record.Rounds,
                Reps: record.Reps,
                Rest: record.Rest,
                Notes: record.Notes,
                Video: record.Video,
                id: record.id
            }
        }));

        return {
            props: {
                workoutData
            }
        };
    } catch (error) {
        console.error("Error fetching data from GitHub database:", error);
        throw new Error("Error fetching data from GitHub database");
    }
};

export default HomePage;
