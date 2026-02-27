import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvlctdhiczrirnvfqhbe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bGN0ZGhpY3pyaXJudmZxaGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY1NzMsImV4cCI6MjA4NTAyMjU3M30.KNplsSdM5ImMzrmlRgw2ZL_1G5nOy9txsUwye-7xa0k'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDebts() {
    console.log('--- Checking Debts Records ---')
    const { data, error } = await supabase
        .from('debts')
        .select('*, members(fullname)')
        .order('created_at', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Recent debts:', JSON.stringify(data, null, 2))
    }
}

checkDebts()
