import Head from 'next/head'
import styles from './Cmpf.module.css'
import { useState } from 'react'
import axios from 'axios'

interface UserData {
    username: string
    firstName: string
    lastName: string
    gender: string
    birthday: string
    avatar: string
}
 
function CompleteProfile() {
    const [form, setForm] = useState<UserData>({
        username: 'test',
        firstName: '',
        lastName: '',
        gender:'',
        birthday: '',
        avatar: ''
    })

    const handleChange = (e: { target: HTMLInputElement; }) => {
        if (e.target.name == "username")
            setForm({...form, username: e.target.value})
        else if (e.target.name == "firstName")
            setForm({...form, firstName: e.target.value})
        else if (e.target.name == "lastName")
            setForm({...form, lastName: e.target.value})
        else if (e.target.name == "gender")
            setForm({...form, gender: e.target.value})
        else if (e.target.name == "birthday")
            setForm({...form, birthday: e.target.value})
    }

    const handleSubmit = async (e:any) => {
        e.preventDefault()
        try {
            const data = await axios.post(`http://localhost:3000/api/create`, {data:form})
            console.log(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Complete profil</title>
            </Head>
            <div className={styles.flexContainer}>
                <h1>Complete your profil</h1>
                <p className={styles.p}>Add your information to complete your profil</p>
                <div className="formContainer">
                    <form onSubmit={handleSubmit} >
                        <div>
                            <input type="file" name="avatar" id="avatar" hidden />
                            <label htmlFor="avatar">
                                <img src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/128/Downloads-icon.png"/>
                            </label>
                        </div>
                        <div className={styles.username} >
                            <label htmlFor="username">Username</label>
                            <input name='username' type="text" placeholder="Username" onChange={handleChange} />
                        </div>
                        <div className={styles.nameContainer}>
                            <div className={styles.name}>
                                <label htmlFor="">First name</label>
                                <input name='firstName' type="text" placeholder="First name" onChange={handleChange} />
                            </div>
                            <div className={styles.name}>
                                <label htmlFor="">Last name</label>
                                <input name='lastName' type="text" placeholder="Last name" onChange={handleChange} />
                            </div>
                            <div className={styles.name}>
                                <label htmlFor="">Gender</label>
                                <input name='gender' type="text" placeholder="Gender" onChange={handleChange} />
                            </div>
                            <div className={styles.name}>
                                <label htmlFor="">Birthday</label>
                                <input name='birthday' type="text" placeholder="Birthday" onChange={handleChange} />
                            </div>
                        </div>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        </div>
    );
}
 
export default CompleteProfile;