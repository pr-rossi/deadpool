import React, { useState, useEffect } from 'react';
import { GetStaticProps, NextPage } from 'next';
import Airtable, { Table, Records, FieldSet } from 'airtable';
import WorkoutSection from '../components/WorkoutSection';

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
  }
  
  interface Exercise {
    id: string;
    fields: ExerciseRecord;
  }
  
  interface HomePageProps {
    workoutData: Exercise[];
  }

const HomePage: NextPage<HomePageProps> = ({ workoutData }) => {
  const [selectedWorkoutWeek, setSelectedWorkoutWeek] = useState<string>('');
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('');
  const [uniqueWorkoutWeeks, setUniqueWorkoutWeeks] = useState<string[]>([]);
  const [uniqueWorkoutDays, setUniqueWorkoutDays] = useState<string[]>([]);
  const [groupedExercises, setGroupedExercises] = useState<{ [key: string]: ExerciseRecord[] }>({});
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  useEffect(() => {
    const workoutWeeks = Array.from(new Set(workoutData.map(item => item.fields.WorkoutWeek).filter(week => week !== undefined))) as string[];
    const workoutDays = Array.from(new Set(workoutData.map(item => item.fields.WorkoutDay).filter(day => day !== undefined))) as string[];
    setUniqueWorkoutWeeks(workoutWeeks);
    setUniqueWorkoutDays(workoutDays);

    if (selectedWorkoutWeek && selectedWorkoutDay) {
      const filteredByDay = workoutData.filter(data => data.fields.WorkoutWeek === selectedWorkoutWeek && data.fields.WorkoutDay === selectedWorkoutDay);

      const grouped = filteredByDay
        .filter(record => record.fields.Group !== undefined)  // Filter out records without a Group
        .reduce<{ [key: string]: ExerciseRecord[] }>((acc, cur) => {
            const groupKey = cur.fields.Group as string;  // Now it's safe to cast, since we filtered
            (acc[groupKey] = acc[groupKey] || []).push(cur.fields);
            return acc;
        }, {});

      setGroupedExercises(grouped);
    }
  }, [selectedWorkoutWeek, selectedWorkoutDay, workoutData]);

  const handleWeekChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkoutWeek(event.target.value);
    setSelectedWorkoutDay('');
  };

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkoutDay(event.target.value);
  };

  const handleSectionClick = (groupId: string) => {
    setOpenSectionId(openSectionId === groupId ? null : groupId);
  };

  return (
    <div className="">
      <div className="select-container">
        <div className="selector">
          <select id="week-selector" value={selectedWorkoutWeek} onChange={handleWeekChange} className="custom-select">
            <option value="">Select Week</option>
            {uniqueWorkoutWeeks.map(week => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
        </div>
        
        <div className="selector">
          <select id="day-selector" value={selectedWorkoutDay} onChange={handleDayChange} disabled={!selectedWorkoutWeek} className="custom-select">
            <option value="">Select Day</option>
            {uniqueWorkoutDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>
      <div className='workout-list'>
        {Object.entries(groupedExercises).map(([groupName, exercises]) => (
            <WorkoutSection
            key={groupName}
            groupTitle={groupName}
            exercises={exercises.filter(e => e.Exercises !== undefined)}  // Filter out undefined Exercises if not allowed
            isOpen={openSectionId === groupName}
            onClick={() => handleSectionClick(groupName)}
            />
        ))}
        </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
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
      },
      revalidate: 1,
    };
};
  

export default HomePage;
