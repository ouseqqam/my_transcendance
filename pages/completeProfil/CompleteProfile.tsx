import Image from 'next/image'
import Head from 'next/head'
import styles from './Cmpf.module.css'

interface CompleteProfileProps {
    username: string
    avatar: string
    firstName: string
    lastName: string
}
 
function CompleteProfile() {
    return (
        <div className={styles.container}>
            <div className={styles.flexContainer}>
                <h1>Complete Your profil</h1>
                <p className={styles.p}>Add your information to complete your profil</p>
            <div className="FormContainer">
                <form method="post">
                    {/* <div className={styles.avatar}></div> */}
                    <div className={styles.username} >
                        <label htmlFor="username">Username</label><br />
                        <input  type="text" placeholder="username" />
                    </div>
                    <div className={styles.nameContainer}>
                        <div className={styles.name}>
                            <label htmlFor="">Firstname</label><br />
                            <input type="text" placeholder="Firstname" />
                        </div>
                        <div className={styles.name}>
                            <label htmlFor="">lastname</label><br />
                            <input type="text" placeholder="Lastname" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
}
 
export default CompleteProfile;