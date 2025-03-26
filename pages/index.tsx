import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Airtable, { Table, Records, Record } from 'airtable';
import { useRouter } from 'next/router';
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
            setUser(JSON.parse(storedUser));
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
        const groupNames = Object.keys(groupedExercises);
        const currentIndex = groupNames.indexOf(selectedExercise!);
        return currentIndex < groupNames.length - 1 ? groupNames[currentIndex + 1] : null;
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
            default: return 'Shoulders & Abs';
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
                        step === 'workout' ? `${selectedWorkoutDay}: ${getDayName(selectedWorkoutDay)}` :
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
                    <div className="video-container">
                        <iframe
                            src={currentVideoUrl}
                            title="Exercise Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </Modal>
            )}
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
                allRecords = allRecords.concat(records.map((record: Record<ExerciseRecord>) => ({
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
