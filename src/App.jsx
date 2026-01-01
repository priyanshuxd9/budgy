import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Counter from './components/Counter';
import FieldSummary from './components/FieldSummary';
import FieldDetail from './components/FieldDetail';
import TotalsDisplay from './components/TotalsDisplay';
import DateFilter from './components/DateFilter';
import Auth from './components/Auth';
import { Plus, Info } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [fields, setFields] = useState([]);
  const [entries, setEntries] = useState([]); // Store entries for current month
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Add Field State
  const [isAdding, setIsAdding] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('money_out');
  const [newFieldRecurring, setNewFieldRecurring] = useState(false);
  // ... [imports and state above]

  // ... [skipping to confirmAddField] 

  const confirmAddField = async () => {
    if (!newFieldName || !session) return;

    // Determine target date (1st of currently selected month)
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const { data, error } = await supabase
      .from('user_fields')
      .insert([{
        user_id: session.user.id,
        label: newFieldName,
        type: newFieldType,
        value: 0, // Legacy
        is_recurring: newFieldRecurring,
        target_date: targetDate.toISOString()
      }])
      .select();

    if (error) {
      console.error('Error adding field:', error);
    } else {
      setFields([...fields, ...data]);
      setIsAdding(false);
      setNewFieldName('');
      setNewFieldType('money_out');
      setNewFieldRecurring(false); // Reset
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData(session.user.id, currentDate);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id, currentDate);
      else {
        setFields([]);
        setEntries([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Re-fetch when date changes
  useEffect(() => {
    if (session) {
      fetchData(session.user.id, currentDate);
    }
  }, [currentDate, session]);

  const fetchData = async (userId, date) => {
    try {
      // 1. Fetch Fields Structure
      // Soft Delete Login: Show if not deleted OR deleted AFTER the start of the current view month
      // actually, simpler: Show if not deleted. If we want history preservation (seeing deleted fields in past months),
      // we need to check if deleted_at > startOfMonth.

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

      let query = supabase
        .from('user_fields')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: fieldsData, error: fieldsError } = await query;
      if (fieldsError) throw fieldsError;

      // Filter in memory for soft deletes logic as Supabase simple filtering might be tricky with "OR" on null
      const visibleFields = (fieldsData || []).filter(field => {
        // Deletion Check
        if (field.deleted_at && new Date(field.deleted_at) <= startOfMonth) {
          return false; // Deleted before this month started
        }

        // Relevance Check
        if (field.is_recurring) return true; // Repeats every month

        if (field.target_date) {
          const target = new Date(field.target_date);
          // Check if same month and year
          return target.getFullYear() === date.getFullYear() && target.getMonth() === date.getMonth();
        }

        // Fallback for old fields without target_date/is_recurring: assume recurring
        return true;
      });

      // 2. Fetch Entries for this Month
      const { data: entriesData, error: entriesError } = await supabase
        .from('field_entries')
        .select('*')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (entriesError) throw entriesError;

      setFields(visibleFields);
      setEntries(entriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthTotalForField = (fieldId) => {
    return entries
      .filter(e => e.field_id === fieldId)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  };

  const handleIncrement = async (id) => {
    // Insert entry +1 for this month
    const { data, error } = await supabase.from('field_entries').insert([{
      field_id: id,
      label: 'increment',
      amount: 1,
      created_at: new Date().toISOString() // Or currentDate if we want to backdate? Let's use real time for interactions
    }]).select();

    if (!error) {
      setEntries([...entries, ...data]);
    }
  };

  const handleDecrement = async (id) => {
    const currentTotal = getMonthTotalForField(id);
    if (currentTotal <= 0) return; // Don't go below 0

    const { data, error } = await supabase.from('field_entries').insert([{
      field_id: id,
      label: 'decrement',
      amount: -1,
      created_at: new Date().toISOString()
    }]).select();

    if (!error) {
      setEntries([...entries, ...data]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this field?')) {
      // Soft Delete
      const { error } = await supabase
        .from('user_fields')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Delete failed:', error);
      } else {
        // Remove from local state immediately
        setFields(fields.filter(f => f.id !== id));
      }
    }
  };



  // Helper for INR currency
  const formatCurrency = (val) => {
    return val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('₹', 'Rs ');
  };

  // derived totals for THIS MONTH
  // Only include 'money_in' and 'money_out' in the monthly calc
  const totalIncome = fields
    .filter(f => f.type === 'money_in')
    .reduce((acc, curr) => acc + getMonthTotalForField(curr.id), 0);

  const totalExpenses = fields
    .filter(f => f.type === 'money_out')
    .reduce((acc, curr) => acc + getMonthTotalForField(curr.id), 0);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Notebook...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            !session ? <Navigate to="/auth" /> : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1>Budgy</h1>
                  <button onClick={() => supabase.auth.signOut()} style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sign Out</button>
                </div>

                <DateFilter currentDate={currentDate} onDateChange={setCurrentDate} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {fields.filter(f => f.type === 'counter').map(field => (
                    <Counter
                      key={field.id}
                      label={field.label}
                      value={getMonthTotalForField(field.id)}
                      onIncrement={() => handleIncrement(field.id)}
                      onDecrement={() => handleDecrement(field.id)}
                      onDelete={() => handleDelete(field.id)}
                    />
                  ))}

                  <div style={{ height: '1px', background: 'var(--line-color)', margin: '1rem 0' }}></div>

                  {fields.filter(f => f.type !== 'counter').map(field => (
                    <FieldSummary
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      total={getMonthTotalForField(field.id)} // Pass the calculated MONTHLY total
                      type={field.type}
                      onDelete={() => handleDelete(field.id)}
                      formatter={formatCurrency}
                    />
                  ))}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  {!isAdding ? (
                    <button onClick={() => setIsAdding(true)} style={{ opacity: 0.5, border: '1px dashed #999', padding: '5px 10px', borderRadius: '4px' }}>
                      + Add Field
                    </button>
                  ) : (
                    <div className="add-field-form" style={{ border: '1px dashed var(--ink-blue)', padding: '1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.5)' }}>
                      <h3 style={{ fontSize: '1rem', marginTop: 0 }}>New Field</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          placeholder="Field Name"
                          value={newFieldName}
                          onChange={e => setNewFieldName(e.target.value)}
                          style={{ borderBottom: '1px solid #ccc', flex: 1 }}
                          autoFocus
                        />
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <select
                          value={newFieldType}
                          onChange={e => setNewFieldType(e.target.value)}
                          style={{ width: '100%', padding: '5px', background: 'transparent', border: 'none', borderBottom: '1px solid #ccc' }}
                        >
                          <option value="counter">Counter (e.g. Leads)</option>
                          <option value="money_in">Income Source (e.g. Salary)</option>
                          <option value="money_out">Expense/EMI (e.g. Rent)</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          id="recurring-check"
                          checked={newFieldRecurring}
                          onChange={e => setNewFieldRecurring(e.target.checked)}
                        />
                        <label htmlFor="recurring-check" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Repeat every month?</label>
                        <div className="tooltip-container" style={{ position: 'relative', display: 'flex' }}>
                          <Info size={16} style={{ cursor: 'help', opacity: 0.6 }} />
                          <span className="tooltip-text">
                            Checked: Field appears in all future months.<br />
                            Unchecked: Field only exists in THIS month.
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={confirmAddField} className="text-green bold">Save</button>
                        <button onClick={() => setIsAdding(false)} className="text-red">Cancel</button>
                      </div>

                      <style>{`
                            .tooltip-container:hover .tooltip-text {
                                visibility: visible;
                                opacity: 1;
                            }
                            .tooltip-text {
                                visibility: hidden;
                                width: 200px;
                                background-color: #555;
                                color: #fff;
                                text-align: center;
                                border-radius: 6px;
                                padding: 5px;
                                position: absolute;
                                z-index: 1;
                                bottom: 125%;
                                left: 50%;
                                margin-left: -100px;
                                opacity: 0;
                                transition: opacity 0.3s;
                                font-size: 0.8rem;
                                font-weight: normal;
                            }
                            .tooltip-text::after {
                                content: "";
                                position: absolute;
                                top: 100%;
                                left: 50%;
                                margin-left: -5px;
                                border-width: 5px;
                                border-style: solid;
                                border-color: #555 transparent transparent transparent;
                            }
                        `}</style>
                    </div>
                  )}
                </div>

                <TotalsDisplay
                  income={totalIncome}
                  expenses={totalExpenses}
                  formatter={formatCurrency}
                />
              </>
            )} />

          <Route path="auth" element={!session ? <Auth /> : <Navigate to="/" />} />

          <Route path="field/:fieldId" element={
            !session ? <Navigate to="/auth" /> :
              <FieldDetail
                refreshParentFields={() => fetchData(session.user.id, currentDate)}
                currentDate={currentDate}
              />
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
