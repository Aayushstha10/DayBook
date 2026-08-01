import axios from "axios";
import { useEffect, useState } from "react";

function Room() {

    const [expenses, setExpenses] = useState([]);

    useEffect(() => {

        fetchExpenses();

    }, []);

    const fetchExpenses = async () => {

        const token = localStorage.getItem("token");

        const res = await axios.get(
            "http://localhost:5000/api/room-expenses",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setExpenses(res.data);

    };

    return (

        <div>

            <h2>Room Expenses</h2>

            <table>

                <thead>

                    <tr>

                        <th>User</th>
                        <th>Email</th>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Category</th>

                    </tr>

                </thead>

                <tbody>

                    {expenses.map((expense) => (

                        <tr key={expense._id}>

                            <td>{expense.user.username}</td>

                            <td>{expense.user.email}</td>

                            <td>{expense.title}</td>

                            <td>{expense.amount}</td>

                            <td>{expense.category}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default Room;