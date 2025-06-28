"use client"

// React Imports
import { useEffect, useRef } from "react"

// MUI Imports
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid2"
import Chip from "@mui/material/Chip"
import { styled } from "@mui/material/styles"

// Third-party Imports
import classnames from "classnames"

// Hook Imports
import { useIntersection } from "@/hooks/useIntersection"

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css"
import styles from "./styles.module.css"

// Data
const team = [
  {
    name: "KITOUNI Ilham",
    position: "Project Supervisor",
    image: "/images/front-pages/landing-page/ilham.png",
    color: "var(--mui-palette-primary-mainOpacity)",
  },
  {
    name: "LASSAKEUR Abdellah",
    position: "Co-Founder",
    image: "/images/front-pages/landing-page/sophie.png",
    color: "var(--mui-palette-warning-mainOpacity)",
  },
  {
    name: "ZITANI Hakim",
    position: "Co-Founder",
    image: "/images/front-pages/landing-page/paul.png",
    color: "var(--mui-palette-info-mainOpacity)",
  },
  {
    name: "HADJ BRAHIM Bakir",
    position: "Co-Founder",
    image: "/images/front-pages/landing-page/nannie.png",
    color: "var(--mui-palette-error-mainOpacity)",
  },
  {
    name: "BOUDRAISSA Sidahmed",
    position: "Co-Founder",
    image: "/images/front-pages/landing-page/chris.png",
    color: "var(--mui-palette-success-mainOpacity)",
  },
]

const Card = styled("div")`
  border-color: ${(props) => props.color};
  border-start-start-radius: 90px;
  border-start-end-radius: 20px;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;
`

const OurTeam = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 },
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="team" className="plb-[100px] bg-backgroundPaper" ref={ref}>
      <div className={frontCommonStyles.layoutSpacing}>
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <Chip size="small" variant="tonal" color="primary" label="EasyCom Team" />
          <div className="flex flex-col items-center gap-y-1 justify-center flex-wrap">
            <div className="flex items-center gap-x-2">
              <Typography color="text.primary" variant="h4">
                <span className="relative z-[1] font-extrabold">
                  Meet our team
                  <img
                    src="/images/front-pages/landing-page/bg-shape.png"
                    alt="bg-shape"
                    className="absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]"
                  />
                </span>
              </Typography>
            </div>
            <Typography className="text-center">Building the future of e-commerce, together.</Typography>
          </div>
        </div>
        {/* Première ligne - Encadrante seule et centrée */}
        <Grid container rowSpacing={16} columnSpacing={6} className="pbs-[100px] justify-center">
          <Grid size={{ xs: 12, sm: 8, md: 6, lg: 3 }}>
            <Card className="border overflow-visible" color={team[0].color}>
              <div className="flex flex-col items-center justify-center p-0">
                <div
                  className={classnames(
                    "flex justify-center is-full mli-auto text-center bs-[189px] relative overflow-visible",
                    styles.teamCard,
                  )}
                  style={{ backgroundColor: team[0].color }}
                >
                  <img
                    src={team[0].image || "/placeholder.svg"}
                    alt={team[0].name}
                    className="bs-[240px] absolute block-start-[-50px]"
                  />
                </div>
                <div className="flex flex-col gap-3 p-5 is-full">
                  <div className="text-center">
                    <Typography variant="h5">{team[0].name}</Typography>
                    <Typography color="text.disabled">{team[0].position}</Typography>
                  </div>
                </div>
              </div>
            </Card>
          </Grid>
        </Grid>

        {/* Deuxième ligne - Les 4 co-fondateurs */}
        <Grid container rowSpacing={16} columnSpacing={6} className="pbs-[60px]">
          {team.slice(1).map((member, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index + 1}>
              <Card className="border overflow-visible" color={member.color}>
                <div className="flex flex-col items-center justify-center p-0">
                  <div
                    className={classnames(
                      "flex justify-center is-full mli-auto text-center bs-[189px] relative overflow-visible",
                      styles.teamCard,
                    )}
                    style={{ backgroundColor: member.color }}
                  >
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="bs-[240px] absolute block-start-[-50px]"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-5 is-full">
                    <div className="text-center">
                      <Typography variant="h5">{member.name}</Typography>
                      <Typography color="text.disabled">{member.position}</Typography>
                    </div>
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  )
}

export default OurTeam
