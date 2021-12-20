<template lang="pug">
  #app
    section.hero.is-primary.is-small
      .hero-head
        nav.navbar
          .container
            .navbar-brand
              a.navbar-item
                span vote app
              span.navbar-burger(data-target='navbarMenuHeroA')
                span
                span
                span
            #navbarMenuHeroA.navbar-menu
              .navbar-end
                span.navbar-item
                  span {{account}}
                span.navbar-item(v-if="!isLogged")
                  a.button.is-primary.is-inverted(@click="connect")
                    span.icon
                      font-awesome-icon(icon="wallet")
                    span Connect Wallet
      // Hero content: will be in the middle
      .hero-body
        .container.has-text-centered
          p.title
            | Vote app
    .container.mt-16
      .columns
        .column.is-10.is-offset-1
          b-message.margin-top(type="is-warning" v-if="voteInfo.voted") You already voted
          b-field.margin-top(grouped)
            b-input(placeholder="Add proposal" v-model="name" expanded)
            p(class="control")
              b-button(label="Add" type="is-primary" @click="addProposal")
          b-table(:data='proposals')
            b-table-column(field="name" label="Name" v-slot="props") {{props.row.name}}
            b-table-column(field="votes" :centered="true" label="Votes" v-slot="props") {{props.row.votesCount}}
            b-table-column(field="votes" :centered="true" label="Your vote" v-slot="props" v-if="voteInfo.voted")
              b-tag(type="is-info" v-if="props.index==voteInfo.vote") your vote
            b-table-column(field="votes" :centered="true" label="Vote for" v-slot="props") 
              b-button(type='is-primary' @click="vote(props.index)" :disabled="voteInfo.voted") vote

</template>

<script>
export default {
  name: 'App',
  data(){
    return{
      name:""
    }
  },
  async mounted() {
    await this.$store.dispatch("connect");
    await this.$store.dispatch("getProposals");
    await this.$store.dispatch("voteInfo");
  },
  methods: {
    async connect() {
      await this.$store.dispatch("connect", 1);
    },
    async addProposal(){
      try{
        await this.$store.dispatch("addProposal",this.name)
        await this.$store.dispatch("getProposals");
      }catch(error){
        this.$buefy.toast.open({
            message: "You need to be the admin to add proposals",
            type: 'is-danger'
        })
      }
    },
    async vote(index){
      const res = await this.$store.dispatch("vote",index);
      if(res.isError){
        this.$buefy.toast.open({
            message: res.msg,
            type: 'is-danger'
        })
      }else{
        this.$buefy.toast.open({
            message: "Success",
            type: 'is-success'
        })

      }
    }
  },
  computed:{
    voteInfo(){
      return this.$store.getters.voteInfo
    },
    account(){
      return this.$store.getters.account
    },
    isLogged(){
      return this.$store.getters.account === null ? false:true
    },
    proposals(){
      return this.$store.getters.proposals
    },
  }
}
</script>

<style>
.margin-top{
  margin-top:40px;
}
</style>
