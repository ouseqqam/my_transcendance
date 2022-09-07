import Head from "next/head"
import styles from './styles/auth.module.css'
import Image from 'next/image'

function Auth() {
    return (
        // <div>
        //     <Head>
        //         <title>Login</title>
        //     </Head>
        //     <div className={styles.flexContainer}>
        //         <div className={styles.body}></div>
        //         <div className={styles.img}>
        //             <p className={styles.txt}>
        //                 Table tennis, also known as ping-pong and whiff-whaff, is a sport in which two or four players hit a lightweight ball
        //             </p>
        //         </div>
        //         <div className={styles.test}>
        //             <button className={styles.btn} type="submit">Sign with 42 intra</button>
        //         </div>
        //     </div>
        // </div>

        <div>
            <Head>
                <title>Login</title>
            </Head>
            <div className={styles.flexContainer} >
                <div className={styles.auth}>
               
                <Image src={"img/logo.png"} alt="test" width={100} height={100} />
                    <p>Let's get started with authenticate with</p>
                    <p>your</p>
                    <button className={styles.btn} type="submit">42 intra</button>
                </div>
                <div className={styles.img}>
                    <div className={styles.txt}>
                        <p>
                            Table tennis, also known as ping-pong and whiff-whaff, is a sport in which two or four 
                            players hit a lightweight ball, also known as the ping-pong ball, back and forth across 
                            a table using small solid rackets. The game takes place on a hard table divided by a net.
                            Except for the initial serve, the rules are generally as follows: players must allow a ball 
                            played toward them to bounce once on their side of the table and must return it so that it bounces
                            on the opposite side at least once. A point is scored when a player fails to return the ball within 
                            the rules. Play is fast and demands quick reactions. Spinning the ball alters its trajectory and limits 
                            an opponent's options, giving the hitter a great advantage.
                        </p>
                    </div>
                </div>
            </div>  
        </div>
    )
}
export default Auth